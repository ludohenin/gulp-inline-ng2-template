"use strict";

var series = require('async').series;
var clone = require('clone');
var compile = require('es6-templates').compile;
var extend = require('extend');
var fs = require('fs');
var isarray = require('isarray');
var join = require('path').join;
var dirname = require('path').dirname;
var resolve = require('path').resolve;
var SourceMapGenerator = require('source-map').SourceMapGenerator;
var SourceNode = require('source-map').SourceNode;

// -----------------------------------------------------------------------------
// Configuration.
var defaults = {
  base: '/',
  target: 'es6',
  indent: 2,
  useRelativePaths: false,
  removeLineBreaks: false,
  removeModuleId: false,
  templateExtension: '.html',
  templateFunction: false,
  templateProcessor: defaultProcessor,
  styleProcessor: defaultProcessor,
  customFilePath: defaultCustomFilePath,
  supportNonExistentFiles: false
};

function defaultProcessor(path, ext, file, cb) {
  return cb(null, file);
}

function defaultCustomFilePath(ext, path) {
  return path;
}

function asLines(str) {
  return str.replace(/\r/g, '').split('\n');
}

function normalizeLineBreaks(str) {
  return asLines(str).join('\n');
}

function getAllMatches(str, regex) {
  var matches = [];
  while (true) {
      var match = regex.exec(str);
      if (match) {
          matches.push(match);
      } else {
          return matches;
      }
  }
}

function createRegExpStringForQuotedHtmlFilePath(opts, quote) {
  return '([^' + quote + ']*' + quote + '[^' + quote + ']*\\' + opts.templateExtension + quote + '([^}),:'+quote+']*?\\))?)';
}

var htmlOptions = function (opts) {
  var quotedHtmlFilePathRegExps = ['\'', '\"', '\`'].map(function(x) { return createRegExpStringForQuotedHtmlFilePath(opts, x)}).join('|');
  return {
    type: 'html',
    prop_url: 'templateUrl',
    prop: 'template',
    pattern: new RegExp('templateUrl\\s*:\\s(' + quotedHtmlFilePathRegExps + ')', "g")
  };
};

var cssOptions = function () {
  return {
    type: 'css',
    prop_url: 'styleUrls',
    prop: 'styles',
    pattern: /styleUrls\s*:\s*\[([^\]]*)\]/g
  };
};

var moduleIdOptions = function () {
  return {
    type: 'module_id',
    prop_url: null,
    prop: null,
    pattern: /,?\s*moduleId\s*:\s*[^,}]*(?=(\n})|(,))/g
  }
};

module.exports = function parser(file, options) {
  var opts = extend({}, defaults, (options || {}));
  var originalFile = normalizeLineBreaks(file.contents.toString());
  var originalLines = asLines(originalFile);
  var sourceNodes = [];
  var transformedFile = originalFile;
  var transformations = [];
  var HTML = false;
  var CSS = false;
  var MODULE_ID = false;

  return function parse(done) {
    series([
      generateTemplateTransformations,
      generateStylesTransformations,
      generateModuleIdTransformations,
      applyTransformations
    ], function (err) {
      var node = new SourceNode(null, null, file.relative, sourceNodes);
      node.setSourceContent(file.relative, file.contents.toString());
      var codeWithSourceMap = node.toStringWithSourceMap({ file: file.basename });
      done(err, {
        contents: codeWithSourceMap.code,
        sourceMap: JSON.parse(codeWithSourceMap.map.toString())
      });
    });
  };

  function generateTemplateTransformations(done) {
    if (opts.templateProcessor) {
      HTML = true;
      extend(opts, htmlOptions(opts));
      generateTransformations(function (err) {
        reset();
        done(err);
      });
    } else {
      reset();
      done();
    }
  }

  function generateStylesTransformations(done) {
    if (opts.styleProcessor) {
      CSS = true;
      extend(opts, cssOptions());
      generateTransformations(function (err) {
        reset();
        done(err);
      });
    } else {
      reset();
      done();
    }
  }

  function generateModuleIdTransformations(done) {
    if (opts.removeModuleId) {
      MODULE_ID = true;
      extend(opts, moduleIdOptions());
      generateTransformations(function (err) {
        reset();
        done(err);
      });
    } else {
      reset();
      done();
    }
  }

  function generateTransformations(done) {
    var seriesArray = [];

    var matches = getAllMatches(originalFile, opts.pattern);
    if(matches) {
      for(var i = 0; i < matches.length; ++i) {
        (function(i) {
          seriesArray.push(function(cb) {
            var match = matches[i];
            generateReplacement(match, function(err, replacement) {
              if(err || (!replacement && replacement != ""))
                cb(err || 'No replacement has been generated');
              else {
                transformations.push({
                  pattern: opts.pattern,
                  matchStart: match.index,
                  matched: match[0],
                  replacement
                });
                cb(null);
              }
            });
            
          });
        }(i));
      }
    }

    series(seriesArray, done);
  }

  function applyTransformations(done) {
    var offset = 0;
    var currentPositionInTransformed = 0;
    transformations.sort(function(a, b) { return a.matchStart - b.matchStart});
    var previousOriginalLineIndex = 0;
    var previousOriginalColumn = 0;
    var previousPositionInOriginal = 0;
    sourceNodes = [];
    for(var i = 0; i < transformations.length; ++i) {
      var transformation = transformations[i];
      var originalLine = getOriginalLine(transformation.matchStart);
      addSourceNodesForUnchangedContent(
        originalFile.substring(previousPositionInOriginal, transformation.matchStart),
        previousOriginalLineIndex,
        previousOriginalColumn);
      var column = transformation.matchStart - originalLine.offset;
      sourceNodes.push(new SourceNode(
        originalLine.index + 1, 
        column,
        file.relative,
        transformation.replacement
      ));
      previousOriginalLineIndex = originalLine.index;
      previousOriginalColumn = column;
      previousPositionInOriginal = transformation.matchStart + transformation.matched.length;
    }

    addSourceNodesForUnchangedContent(
      originalFile.substring(previousPositionInOriginal, originalFile.length), 
      previousOriginalLineIndex, 
      previousOriginalColumn);
    done(null);
  }

  function generateReplacement(match, cb) {
    var _urls;
    var frag = match[0];
    var fnIndex = frag.indexOf('(');
    if (opts.prop_url && fnIndex > -1 && opts.templateFunction) {
      // Using template function.

      // Check if templateFunction uses single quotes or quote marks.
      var urlRegex = frag.indexOf('\'') !== -1 ? /'([\s\S]*)'/ : /"([\s\S]*)"/;

      // Need to clone the regex, since exec() keeps the lastIndex.
      var testRegex = clone(urlRegex), lineCheck = clone(urlRegex);
      var hasMultiline = testRegex.exec(frag)[1];

      if (hasMultiline && hasMultiline.lastIndexOf(",") !== -1) {
        _urls = [];
        // Split fragments that kept comma.
        var files = frag.split(",");
        // Populate url list, using the return value of the templateFunction.
        for (var i = 0; i < files.length; i++) {
          _urls.push(opts.templateFunction(lineCheck.exec(files[i])[1]));
        }
      }

      if (!_urls) {
        _urls = opts.templateFunction(urlRegex.exec(frag)[1]);
      }
    } else if (opts.prop_url) {
      _urls = eval('({' + frag + '})')[opts.prop_url];
    } else {
      _urls = [];
    }

    var urls  = isarray(_urls) ? _urls : [_urls];
    var line  = getOriginalLine(match.index).content;
    var indentation = /^\s*/.exec(line)[0];
    var assetFiles  = '';
    var startOfInsertionBlock = '\n';
    var endOfInsertionBlock = '\n';

    function postProcessAssetFiles(cb) {
      assetFiles = assetFiles
        .replace(/\\/g, '\\\\')    // Escape existing backslashes for the final output into a string literal, which would otherwise escape the character after it
        .replace(/\${/g, '\\${')  // Escape ES6 ${myVar} to \${myVar}. ES6 would otherwise look for a local variable named myVar
        .replace(/`/g, '\\`')      // Escape ES6 backticks which would end the ES6 template literal string too early
        .replace(/(\n*)$/, '');    // Trim trailing line breaks

      // We don't need indentation if we are going to insert it as one line
      if(!opts.removeLineBreaks) {
        // Indent content.
        assetFiles = indent(assetFiles);
      }

      if(opts.removeLineBreaks) {
        assetFiles = removeLineBreaks(assetFiles);
        // don't need the indentation
        indentation = '';
        startOfInsertionBlock = '';
        endOfInsertionBlock = '';
      }

      // Build the final string.
      if ('html' === opts.type)
        assetFiles = opts.prop + ': `' + startOfInsertionBlock + assetFiles + endOfInsertionBlock + indentation + '`';
      if ('css' === opts.type)
        assetFiles = opts.prop + ': [`' + startOfInsertionBlock + assetFiles + endOfInsertionBlock + indentation + '`]';
      if ('es5' === opts.target) assetFiles = compile(assetFiles).code;

      cb(null, assetFiles);
    }

    
    getFilesAndApplyCustomProcessor(function(err) { 
      if(err) cb(err);
      else postProcessAssetFiles(cb);
    });

    function getFilesAndApplyCustomProcessor(cb) {
      series(urls.map(function (url) {
        return function (cb) {
          var data = getFileData(url);
          var path = resolve(dirname(file.path), url);
          var ext = /\.[0-9a-z]+$/i.exec(url);
          if (HTML && opts.templateProcessor) {
            process.nextTick(function () {
              opts.templateProcessor(path, ext, data, customProcessorCallback(cb));
            });
          }
          if (CSS && opts.styleProcessor) {
            process.nextTick(function () {
              opts.styleProcessor(path, ext, data, customProcessorCallback(cb));
            });
          }
        };
      }), cb);

      function customProcessorCallback(cb) {
        return function (err, file) {
          if (err) return cb(err);
          assetFiles += file;
          process.nextTick(cb);
        };
      }
    }

    function getFileData(filepath) {
      var absPath = opts.useRelativePaths ? join(dirname(file.path), filepath)
                                          : join(process.cwd(), opts.base, filepath);

      if(opts.supportNonExistentFiles && !fs.existsSync(absPath)) {
        return '';
      }

      var ext = /\.[0-9a-z]+$/i.exec(absPath);
      absPath = opts.customFilePath(ext, absPath);

      return fs.readFileSync(absPath)
        .toString()
        .replace(/\r/g, '')
        .replace(/[\u200B-\u200D\uFEFF]/g, '');
    }

    function indent(str) {
      var lines = [];
      var spaces = '';
      for (var i = 0; i < indentation.length + opts.indent; i++) { spaces += ' '; }
      str.split('\n').forEach(function (line) {
        // Add indentation spaces only to non-empty lines.
        lines.push((/^(\s*)$/.test(line) ? '' : spaces) + line);
      });
      return lines.join('\n');
    }

    function removeLineBreaks(str) {
      return str.replace(/(\r\n|\n|\r)/gm," ");
    }
  }  
  
  function reset() {
    HTML = false;
    CSS = false;
    MODULE_ID = false;
  }

  function getLine(lines, position) {
    var offset = 0;
    for(var i = 0; i < lines.length; ++i) {
      var line = lines[i];
      if(position <= offset + line.length)
        return { content: line, index: i, offset };
      
      offset += line.length + 1;
    }
  }

  function getOriginalLine(position) {
    return getLine(originalLines, position);
  }
  
  function addSourceNodesForUnchangedContent(contentSincePrevious, previousOriginalLineIndex, previousOriginalColumn) {
    var lines = contentSincePrevious.split('\n');
    for(var i = 0; i < lines.length - 1; ++i) {
      lines[i] = lines[i] + '\n';
    }
    sourceNodes.push(new SourceNode(
      previousOriginalLineIndex + 1,
      previousOriginalColumn,
      file.relative,
      lines[0]
    ));
    for(var i = 1; i < lines.length; ++i) {
      sourceNodes.push(new SourceNode(
        previousOriginalLineIndex + i + 1,
        0,
        file.relative,
        lines[i]
      ))
    }
  }
};

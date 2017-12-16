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

var htmlOptions = function (opts) {
  return {
    type: 'html',
    prop_url: 'templateUrl',
    prop: 'template',
    start_pattern: /templateUrl\s*:.*/,
    end_pattern: new RegExp('.*\\' + opts.templateExtension + '\s*(\'\\)|\')|.*\\' + opts.templateExtension + '\s*("\\)|")|.*\\' + opts.templateExtension + '\s*(`\\)|`)'),
    oneliner_pattern: new RegExp('templateUrl.*(\\' + opts.templateExtension + '\s*(\'\\)|\')|\\' + opts.templateExtension + 's*("\\)|")|\\' + opts.templateExtension + 's*(`\\)|`))')
  };
};

var cssOptions = function () {
  return {
    type: 'css',
    prop_url: 'styleUrls',
    prop: 'styles',
    start_pattern: /styleUrls\s*:.*/,
    end_pattern: /.*]/,
    oneliner_pattern: /styleUrls(.*?)]/
  };
};

var moduleIdOptions = function () {
  return {
    type: 'module_id',
    prop_url: null,
    prop: null,
    start_pattern: /\s*moduleId\s*:[^,}]*,?/,
    end_pattern: /[,}],?/,
    oneliner_pattern: /moduleId\s*:\s*[^,}]*,?/
  }
};


module.exports = function parser(file, options) {
  var opts = extend({}, defaults, (options || {}));
  var lines = file.contents.toString().replace(/\r/g, '').split('\n');
  var start_line_idx, end_line_idx, frag;
  var HTML = false;
  var CSS = false;
  var MODULE_ID = false;

  return function parse(done) {
    series([
      processTemplate,
      processStyles,
      removeModuleId
    ], function (err) {
      done(err, lines.join('\n'));
    });
  };


  function processTemplate(done) {
    if (opts.templateProcessor) {
      HTML = true;
      extend(opts, htmlOptions(opts));
      execute(function (err) {
        reset();
        done(err);
      });
    }
  }

  function processStyles(done) {
    if (opts.styleProcessor) {
      CSS = true;
      extend(opts, cssOptions());
      execute(function (err) {
        reset();
        done(err);
      });
    }
  }

  function removeModuleId(done) {
    if (opts.removeModuleId) {
      MODULE_ID = true;
      extend(opts, moduleIdOptions());
      execute(function (err) {
        reset();
        done(err);
      });
    } else {
      reset();
      done();
    }
  }

  function execute(done) {
    var seriesArray = [];

    for(var i = 0; i < lines.length; i++) {
      (function (i) {
        seriesArray.push(function (cb) {
          var idx = i;
          var line = lines[idx];
          getIndexes(line, idx);
          if (i === end_line_idx && start_line_idx) {
            series([
              getFragment,
              replaceFrag
            ], cb);
          } else {
            process.nextTick(cb);
          }
        });
      }(i));
    }

    series(seriesArray, done);
  }

  function getIndexes(line, i) {
      if (opts.start_pattern.test(line)) {
        start_line_idx = i;
      }
      if (opts.end_pattern.test(line)) {
        // Match end pattern without start.
        // end_line_idx is still equal to previous loop turn value.
        if (start_line_idx <= end_line_idx) return;
        end_line_idx = i;
      }
  }

  function getFragment(cb) {
    var fragStart, fragEnd;
    if (start_line_idx < 0 || end_line_idx < 0) return cb();
    // One liner.
    if (start_line_idx === end_line_idx) {
      frag = opts.oneliner_pattern.exec(lines[start_line_idx])[0];
    }
    // One or more lines.
    if (start_line_idx < end_line_idx) {
      fragStart = opts.start_pattern.exec(lines[start_line_idx])[0];
      fragEnd   = opts.end_pattern.exec(lines[end_line_idx])[0];
      frag      = concatLines();
    }

    process.nextTick(cb);

    function concatLines() {
      var _lines = clone(lines);
      _lines[start_line_idx] = fragStart;
      _lines[end_line_idx]   = fragEnd;
      return _lines.splice(start_line_idx, end_line_idx - start_line_idx + 1).join('');
    }
  }

  function replaceFrag(cb) {
    var _urls;
    var fnIndex = frag.indexOf('(');

    if (opts.prop_url && fnIndex > -1 && opts.templateFunction) {
      // Using template function.

      // Check if templateFunction uses single quotes or quote marks.
      var urlRegex = frag.indexOf('\'') != -1 ? /'(.*)'/ : /"(.*)"/;

      // Need to clone the regex, since exec() keeps the lastIndex.
      var testRegex = clone(urlRegex), lineCheck = clone(urlRegex);
      var hasMultiline = testRegex.exec(frag)[1];

      if (hasMultiline && hasMultiline.lastIndexOf(",") != -1) {
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
    var line  = lines[start_line_idx];
    var indentation = /^\s*/.exec(line)[0];
    var assetFiles  = '';
    var startOfInsertionBlock = '\n';
    var endOfInsertionBlock = '\n';

    series([
      getFilesAndApplyCustomProcessor,
      _replaceFrag
    ], cb);

    function _replaceFrag(cb) {
      assetFiles = assetFiles
        .replace(/\\/g, '\\\\')    // Escape existing backslashes for the final output into a string literal, which would otherwise escape the character after it
        .replace(/\$\{/g, '\\${')  // Escape ES6 ${myVar} to \${myVar}. ES6 would otherwise look for a local variable named myVar
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

      // One liner.
      if (start_line_idx === end_line_idx) {
        lines[start_line_idx] = line.replace(opts.oneliner_pattern, assetFiles);
      }
      // One or more lines.
      if (start_line_idx < end_line_idx) {
        if ('module_id' !== opts.type && /,$/.test(lines[end_line_idx])) {
          assetFiles += ',';
        }
        if (/\}\)$/.test(lines[end_line_idx])) {
          assetFiles += '})';
        }

        lines[start_line_idx] = line.replace(opts.start_pattern, assetFiles);
        lines.splice(start_line_idx + 1, end_line_idx - start_line_idx);
      }

      if (/^\s*$/.test(lines[start_line_idx])) {
        lines.splice(start_line_idx, 1);
      }

      cb(null);
    }

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
    start_line_idx = undefined;
    end_line_idx = undefined;
    frag = undefined;
    HTML = false;
    CSS = false;
    MODULE_ID = false;
  }
};

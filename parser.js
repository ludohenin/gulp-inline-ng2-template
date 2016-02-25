"use strict";

var clone = require('clone');
var compile = require('es6-templates').compile;
var extend = require('extend');
var fs = require('fs');
var isarray = require('isarray');
var join = require('path').join;
var dirname = require('path').dirname;


// -----------------------------------------------------------------------------
// Configuration.
var defaults = {
  base: '/',
  target: 'es6',
  indent: 2,
  useRelativePaths: false,
  removeLineBreaks: false,
  templateExtension: '.html',
  templateFunction: false,
  templateProcessor: defaultProcessor,
  styleProcessor: defaultProcessor
};

function defaultProcessor(path, file) {
  return file;
}

var htmlOptions = function (opts) {
  return {
    type: 'html',
    prop_url: 'templateUrl',
    prop: 'template',
    start_pattern: /templateUrl:.*/,
    end_pattern: new RegExp('.*\\' + opts.templateExtension + '\s*(\'\\)|\')|.*\\' + opts.templateExtension + '\s*("\\)|")'),
    oneliner_pattern: new RegExp('templateUrl.*(\\' + opts.templateExtension + '\s*(\'\\)|\')|\\' + opts.templateExtension + 's*("\\)|"))')
  };
};

var cssOptions = function () {
  return {
    type: 'css',
    prop_url: 'styleUrls',
    prop: 'styles',
    start_pattern: /styleUrls:.*/,
    end_pattern: /.*]/,
    oneliner_pattern: /styleUrls(.*?)]/
  };
};


module.exports = function parser(file, options) {
  var opts = extend({}, defaults, (options || {}));
  var lines = file.contents.toString().replace(/\r/g, '').split('\n');
  var start_line_idx, end_line_idx, frag;
  var HTML = false;
  var CSS = false;

  if (opts.templateProcessor) {
    HTML = true;
    extend(opts, htmlOptions(opts));
    execute();
    reset();
  }
  if (opts.styleProcessor) {
    CSS = true;
    extend(opts, cssOptions());
    execute();
    reset();
  }

  return lines.join('\n');


  function execute() {
    for(var i = 0; i < lines.length; i++) {
      var line = lines[i];
      getIndexes(line, i);
      if (i === end_line_idx && start_line_idx) {
        getFragment();
        replaceFrag();
      }
    }
  }

  function getIndexes(line, i) {
      if (opts.start_pattern.test(line)) {
        start_line_idx = i;
      }
      if (opts.end_pattern.test(line)) {
        // Match end pattern without start.
        // end_line_idx is till equal to previous loop turn value.
        if (start_line_idx <= end_line_idx) return;
        end_line_idx = i;
      }
  }

  function getFragment() {
    var fragStart, fragEnd;
    if (start_line_idx < 0 || end_line_idx < 0) return;
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

    function concatLines() {
      var _lines = clone(lines);
      _lines[start_line_idx] = fragStart;
      _lines[end_line_idx]   = fragEnd;
      return _lines.splice(start_line_idx, end_line_idx - start_line_idx + 1).join('');
    }
  }

  function replaceFrag() {
    var _urls;
    var fnIndex = frag.indexOf('(');
    if (fnIndex > -1 && opts.templateFunction) {
      // Using template function.
      _urls = opts.templateFunction(/'(.*)'/.exec(frag)[1]);
    } else {
      _urls = eval('({' + frag + '})')[opts.prop_url];
    }

    var urls  = isarray(_urls) ? _urls : [_urls];
    var line  = lines[start_line_idx];
    var indentation = /^\s*/.exec(line)[0];
    var assetFiles  = '';
    var startOfInsertionBlock = '\n';
    var endOfInsertionBlock = '\n';

    urls.forEach(function (url) {
      var file = getFile(url);
      var ext = /\.[0-9a-z]+$/i.exec(url);
      if (HTML && opts.templateProcessor) {
        file = opts.templateProcessor(ext, file);
      }
      if (CSS && opts.styleProcessor) {
        file = opts.styleProcessor(ext, file);
      }
      assetFiles += file;
    });

    // Trim trailing line breaks.
    assetFiles = assetFiles.replace(/(\n*)$/, '');

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
      if (/(,)$/.test(lines[end_line_idx])) assetFiles += ',';
      lines[start_line_idx] = line.replace(opts.start_pattern, assetFiles);
      lines.splice(start_line_idx + 1, end_line_idx - start_line_idx);
    }

    function getFile(filepath) {
      var absPath = opts.useRelativePaths ? join(dirname(file.path), filepath)
                                          : join(process.cwd(), opts.base, filepath);

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
  }
};

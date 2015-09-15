"use strict";

var clone = require('clone');
var compile = require('es6-templates').compile;
var extend = require('extend');
var fs = require('fs');
var isarray = require('isarray');
var join = require('path').join;


// -----------------------------------------------------------------------------
// Configuration.
var defaults = {
  base: '/',
  html: true,
  css: true,
  // html_ext: 'html',
  target: 'es6',
  indent: 2
};

var HTMLOptions = {
  type: 'html',
  prop_url: 'templateUrl',
  prop: 'template',
  start_pattern: /templateUrl.*/,
  end_pattern: /.*\.html\s*'|.*\.html\s*"/,
  oneliner_pattern: /templateUrl.*(\.html\s*'|\.html\s*")/
};

var CSSOptions = {
  type: 'css',
  prop_url: 'styleUrls',
  prop: 'styles',
  start_pattern: /styleUrls.*/,
  end_pattern: /.*]/,
  oneliner_pattern: /styleUrls(.*?)]/
};


module.exports = function parser(file, options) {
  var opts = extend({}, defaults, (options || {}));
  var lines = file.replace(/\r/g, '').split('\n');
  var start_line_idx, end_line_idx, frag;

  if (opts.html) {
    extend(opts, HTMLOptions);
    execute();
    reset();
  }
  if (opts.css) {
    extend(opts, CSSOptions);
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
    var _urls = eval('({' + frag + '})')[opts.prop_url];
    var urls  = isarray(_urls) ? _urls : [_urls];
    var line  = lines[start_line_idx];
    var indentation = /^\s*/.exec(line)[0];
    var assetFiles  = '';

    urls.forEach(function (url) {
      assetFiles += getFile(url);
    });

    // Trim trailing line breaks.
    assetFiles = assetFiles.replace(/(\n*)$/, '');

    // Indent content.
    assetFiles = indent(assetFiles);

    // Build the final string.
    if ('html' === opts.type)  assetFiles = opts.prop + ': `\n' + assetFiles + '\n' + indentation + '`';
    if ('css' === opts.type)   assetFiles = opts.prop + ': [`\n' + assetFiles + '\n' + indentation + '`]';
    if ('es5' === opts.target) assetFiles = compile(assetFiles);

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
      var absPath = join(process.cwd(), opts.base, filepath);
      return fs.readFileSync(absPath).toString().replace(/\r/g, '');
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
  }

  function reset() {
    start_line_idx = undefined;
    end_line_idx = undefined;
    frag = undefined;
  }
};

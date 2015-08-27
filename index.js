'use strict';
var compile = require('es6-templates').compile;
var extend = require('extend');
var fs = require('fs');
var gutil = require('gulp-util');
var join = require('path').join;
var through = require('through2');

module.exports = exports = function (options) {
  var defaults = {
    base: '/',
    extension: '.html',
    quote: "'",
    target: 'es6'
  };

  options = extend({}, defaults, options || {});

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('gulp-ng2-inline-template', 'Streaming not supported'));
      return;
    }

    try {
      file.contents = new Buffer(inline(file.contents.toString(), options));
      this.push(file);
    } catch (err) {
      this.emit('error', new gutil.PluginError('gulp-ng2-inline-template', err, {fileName: file.path}));
    }

    cb();
  });
};


var TEMPLATE_URL = 'templateUrl';
var TEMPLATE = 'template'

function inline(file, options) {
  var lines = file.split('\n');

  lines.forEach(function (line, i) {
    if (line.indexOf(TEMPLATE_URL) > -1) {
      var index1 = line.indexOf(options.quote) + 1;
      var index2 = line.lastIndexOf(options.extension) + options.extension.length;
      var tplPath = line.substring(index1, index2);
      var tplAbsPath = join(process.cwd(), options.base, tplPath);
      var tpl = fs.readFileSync(tplAbsPath, 'utf8');

      lines[i] = replace(line, tpl, options);;
    }
  });

  var content = lines.length > 1 ? lines.join('\n') : lines[0];

  return content;
}


// ----------------------
// Utils
function replace(line, tpl, options) {
  var re = new RegExp('(' + TEMPLATE_URL + '.*' + options.quote + ')');
  var match = re.exec(line)[0];
  var newLine = line.replace(match, TEMPLATE + ': ' + getTemplateString(tpl, options));
  return newLine;
}
function getTemplateString(tpl, options) {
  var string =  '`' +
                trimTrailingLineBreak(tpl) +
                '`';
  if (options.target === 'es5') {
    string = compile(string);
  }

  return string;
}
function trimTrailingLineBreak(tpl) {
  var lines = tpl.split('\n');
  // var trim = lines.splice(-1, 1);
  return (lines.pop() === '' ? lines.join('\n') : tpl);
}

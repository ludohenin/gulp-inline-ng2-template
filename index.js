"use strict";

var gutil = require('gulp-util');
var through = require('through2');


var PLUGIN_NAME = 'gulp-inline-ng2-template';

module.exports = exports = function inline(options) {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return;
    }

    try {
      file.contents = new Buffer(require('./parser')(file.contents.toString(), options));
      this.push(file);
    } catch (err) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, err, {fileName: file.path}));
    }

    cb();
  });
};

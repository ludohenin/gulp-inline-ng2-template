"use strict";

var gutil = require('gulp-util');
var through = require('through2');


var PLUGIN_NAME = 'gulp-inline-ng2-template';

module.exports = exports = function inline(options) {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }

    try {
      var parse = require('./parser')(file, options);
      var _this = this

      parse(function (err, contents) {
        if (err) return cb(new gutil.PluginError(PLUGIN_NAME, err, {fileName: file.path}));
        file.contents = new Buffer(contents);
        _this.push(file);
        process.nextTick(cb);
      });

    } catch (err) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, err, {fileName: file.path}));
    }
  });
};

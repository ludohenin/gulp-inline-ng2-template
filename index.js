"use strict";

var PluginError = require('plugin-error');
var through = require('through2');
var applySourceMap = require("vinyl-sourcemaps-apply");

var PLUGIN_NAME = 'gulp-inline-ng2-template';

module.exports = exports = function inline(options) {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }

    try {
      var parse = require('./parser')(file, options);
      var _this = this;

      parse(function (err, result) {
        if (err) return cb(new PluginError(PLUGIN_NAME, err, {fileName: file.path}));
        file.contents = Buffer.from(result.contents);
        applySourceMap(file, result.sourceMap);

        _this.push(file);
        process.nextTick(cb);
      });

    } catch (err) {
      this.emit('error', new PluginError(PLUGIN_NAME, err, {fileName: file.path}));
    }
  });
};

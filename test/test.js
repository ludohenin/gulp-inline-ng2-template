"use strict";

var assert = require('assert');
var fs = require('fs');
var File = require('vinyl');
var inline = require('../index');
var join = require('path').join;
var viewFunction = function (path) {
  return path;
};


describe('gulp-inline-ng2-template', function () {
  it('should work with default config', function (done) {
    var paths = {
      TEST_FILE      : './test/fixtures/templates.js',
      RESULT_EXPECTED: './test/fixtures/result_expected.js',
      RESULT_ACTUAL  : './test/fixtures/result_actual.js'
    };

    runTest(paths, { base: 'test/fixtures' }, done);
  });

  it('should work with relative paths', function (done) {
    var paths = {
      TEST_FILE      : './test/fixtures/templates_relative.js',
      RESULT_EXPECTED: './test/fixtures/result_expected_relative.js',
      RESULT_ACTUAL  : './test/fixtures/result_actual_relative.js'
    };

    runTest(paths, { jade: true, useRelativePaths: true }, done);
  });

  it('should work with default config and one line options', function (done) {
    var paths = {
      TEST_FILE      : './test/fixtures/templates.js',
      RESULT_EXPECTED: './test/fixtures/result_expected_one_line.js',
      RESULT_ACTUAL  : './test/fixtures/result_actual_one_line.js'
    };

    runTest(paths, { base: 'test/fixtures', removeLineBreaks: true }, done);
  });

  it('should work with default config and templateUrl as a function', function (done) {
    var paths = {
      TEST_FILE      : './test/fixtures/templates_function.js',
      RESULT_EXPECTED: './test/fixtures/result_expected_function.js',
      RESULT_ACTUAL  : './test/fixtures/result_actual_function.js'
    };

    var OPTIONS = {
      base: 'test/fixtures',
      templateFunction: viewFunction
    };

    runTest(paths, OPTIONS, done);
  });

  it('should work with templates and styles processors', function (done) {
    var paths = {
      TEST_FILE      : './test/fixtures/templates_processors.js',
      RESULT_EXPECTED: './test/fixtures/result_expected_processors.js',
      RESULT_ACTUAL  : './test/fixtures/result_actual_processors.js'
    };

    var OPTIONS = {
      base: 'test/fixtures',
      useRelative: true,
      templateExtension: 'jade',
      templateProcessor: function (path, file, cb) {
        return cb(null, require('jade').render(file));
      },
      styleProcessor: function (path, file, cb) {
        return cb(null, require('stylus').render(file));
      }
    };

    runTest(paths, OPTIONS, done);
  });

  it('should work with templates and styles with backticks in them', function(done) {
    var paths = {
      TEST_FILE      : './test/fixtures/templates_unescaped.js',
      RESULT_EXPECTED: './test/fixtures/result_expected_unescaped.js',
      RESULT_ACTUAL  : './test/fixtures/result_actual_unescaped.js'
    };

    runTest(paths, { base: 'test/fixtures' }, done);
  });

  it('should work when templateUrl and styleUrl files do not exist', function(done) {
    var paths = {
      TEST_FILE      : './test/fixtures/templates_nonexistent_files.js',
      RESULT_EXPECTED: './test/fixtures/result_expected_nonexistent_files.js',
      RESULT_ACTUAL  : './test/fixtures/result_actual_nonexistent_files.js'
    };

    runTest(paths, { supportNonExistentFiles: true }, done);
  });

  it('should work with different quote marks', function (done) {
    var paths = {
      TEST_FILE      : './test/fixtures/templates_quotemark.js',
      RESULT_EXPECTED: './test/fixtures/result_expected_quotemark.js',
      RESULT_ACTUAL  : './test/fixtures/result_actual_quotemark.js'
    };

    runTest(paths, { base: 'test/fixtures' }, done);
  });

  it('should work with template function and different quote marks', function (done) {
    var paths = {
      TEST_FILE      : './test/fixtures/templates_quotemark_function.js',
      RESULT_EXPECTED: './test/fixtures/result_expected_quotemark_function.js',
      RESULT_ACTUAL  : './test/fixtures/result_actual_quotemark_function.js'
    };

    var OPTIONS = { 
      base: 'test/fixtures',
      templateFunction: viewFunction
    };

    runTest(paths, OPTIONS, done);
  });
});



function runTest(paths, pluginOptions, done) {
  var jsFile = new File({
    contents: new Buffer(fs.readFileSync(paths.TEST_FILE).toString()),
    path: join(process.cwd(), 'test/fixtures/someSrcFile')
  });

  var stream = inline(pluginOptions);
  stream.write(jsFile);

  stream.once('data', function(file) {
    var result = file.contents.toString();
    // Save the result in a file.
    fs.writeFileSync(paths.RESULT_ACTUAL, result, 'utf8');

    assert.equal(
      result,
      fs.readFileSync(paths.RESULT_EXPECTED).toString()
    );
    done();
  });
}

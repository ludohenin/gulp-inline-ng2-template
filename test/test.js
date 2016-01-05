"use strict";

var assert = require('assert');
var fs = require('fs');
var File = require('vinyl');
var inline = require('../index');
var join = require('path').join;


describe('gulp-inline-ng2-template', function () {
  it('should work with default config', function (done) {
    var paths = {
      TEST_FILE      : './test/fixtures/templates.js',
      RESULT_EXPECTED: './test/fixtures/result_expected.js',
      RESULT_ACTUAL  : './test/fixtures/result_actual.js'
    }

    runTest(paths, { base: 'test/fixtures' }, done);
  });

  it('should work with Jade', function (done) {
    var paths = {
      TEST_FILE      : './test/fixtures/templates_jade.js',
      RESULT_EXPECTED: './test/fixtures/result_expected_jade.js',
      RESULT_ACTUAL  : './test/fixtures/result_actual_jade.js'
    }

    runTest(paths, { base: 'test/fixtures', jade: true }, done);
  });

  it('should work with relative paths', function (done) {
    var paths = {
      TEST_FILE      : './test/fixtures/templates_relative.js',
      RESULT_EXPECTED: './test/fixtures/result_expected_relative.js',
      RESULT_ACTUAL  : './test/fixtures/result_actual_relative.js'
    };

    runTest(paths, { jade: true, useRelativePaths: true }, done);
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
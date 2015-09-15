"use strict";

var assert = require('assert');
var extend = require('extend');
var fs = require('fs');
var join = require('path').join;
var inline = require('../index');
var File = require('vinyl');

var TEST_FILE = './test/fixtures/templates.js'
var RESULT_EXPECTED = './test/fixtures/result_expected.js'
var RESULT_ACTUAL = './test/fixtures/result_actual.js';

// var result = parser(fs.readFileSync(TEST_FILE).toString(), { base: 'test/fixtures' });
// fs.writeFileSync(RESULT_ACTUAL, result, 'utf8');

describe('gulp-inline-ng2-template', function () {
  it('should simply work', function (done) {
    var jsFile = new File({
      contents: new Buffer(fs.readFileSync(TEST_FILE).toString())
    });

    var stream = inline({ base: 'test/fixtures' });
    stream.write(jsFile);

    stream.once('data', function(file) {
      // Save the result in a file.
      fs.writeFileSync(RESULT_ACTUAL, file.contents.toString(), 'utf8');

      assert.equal(
        file.contents.toString(),
        fs.readFileSync(RESULT_EXPECTED).toString()
      );
      done();
    });

  });
});

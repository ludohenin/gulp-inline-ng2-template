"use strict";

var assert = require('assert');
var fs = require('fs');
var File = require('vinyl');
var inline = require('../index');

var TEST_FILE       = './test/fixtures/templates.js';
var RESULT_EXPECTED = './test/fixtures/result_expected.js';
var RESULT_ACTUAL   = './test/fixtures/result_actual.js';


describe('gulp-inline-ng2-template', function () {
  it('should simply work', function (done) {
    var jsFile = new File({
      contents: new Buffer(fs.readFileSync(TEST_FILE).toString())
    });

    var stream = inline({ base: 'test/fixtures' });
    stream.write(jsFile);

    stream.once('data', function(file) {
      var result = file.contents.toString();
      // Save the result in a file.
      fs.writeFileSync(RESULT_ACTUAL, result, 'utf8');

      assert.equal(
        result,
        fs.readFileSync(RESULT_EXPECTED).toString()
      );
      done();
    });

  });
});

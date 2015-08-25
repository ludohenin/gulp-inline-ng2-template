'use strict';
var assert = require('assert');
var inline = require('../');
var fs = require('fs');
var File = require('vinyl');

var inlinerOptions = {
  base: '/test/fixtures'
};

describe('gulp-inline-ng2-template', function () {
  var result = "template: `<h1>Test template</h1>`,";

  it('should inline the template', function (done) {
    var jsFile = new File({
      contents: new Buffer("templateUrl: 'template.html',")
    });

    var stream = inline(inlinerOptions);
    stream.write(jsFile);
    stream.once('data', function(file) {
      assert.equal(file.contents.toString(), result.toString());
      done();
    });
  });

  it('should should work without trailing coma', function (done) {
    var res = "template: `<h1>Test template</h1>`";
    var jsFile = new File({
      contents: new Buffer("templateUrl: 'template.html'")
    });

    var stream = inline(inlinerOptions);
    stream.write(jsFile);
    stream.once('data', function(file) {
      assert.equal(file.contents.toString(), res.toString());
      done();
    });
  });

  it('should should work with one-liner', function (done) {
    var res = "@View({template: `<h1>Test template</h1>`})";
    var jsFile = new File({
      contents: new Buffer("@View({templateUrl: 'template.html'})")
    });

    var stream = inline(inlinerOptions);
    stream.write(jsFile);
    stream.once('data', function(file) {
      assert.equal(file.contents.toString(), res.toString());
      done();
    });
  });

  it('should should still work with one-liner', function (done) {
    var res = "@View({template: `<h1>Test template</h1>`, directive: [NgIf]})";
    var jsFile = new File({
      contents: new Buffer("@View({templateUrl: 'template.html', directive: [NgIf]})")
    });

    var stream = inline(inlinerOptions);
    stream.write(jsFile);
    stream.once('data', function(file) {
      assert.equal(file.contents.toString(), res.toString());
      done();
    });
  });

  it('should should work with multiple lines', function (done) {
    var res = "@View({\ntemplate: `<h1>Test template</h1>`,\ndirective: [NgIf]})";
    var jsFile = new File({
      contents: new Buffer("@View({\ntemplateUrl: 'template.html',\ndirective: [NgIf]})")
    });

    var stream = inline(inlinerOptions);
    stream.write(jsFile);
    stream.once('data', function(file) {
      assert.equal(file.contents.toString(), res.toString());
      done();
    });
  });

  it('should work with options', function () {
    inlinerOptions.quote = '"';
    inlinerOptions.extension = '.htm';

    var jsFile = new File({
      contents: new Buffer('templateUrl: "template.htm",')
    });

    var stream = inline(inlinerOptions);
    stream.write(jsFile);
    stream.once('data', function(file) {
      assert.equal(file.contents.toString(), result.toString());
      done();
    });
  });
});

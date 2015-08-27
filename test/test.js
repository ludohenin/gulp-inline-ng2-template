'use strict';
var assert = require('assert');
var extend = require('extend');
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
      assert.equal(file.contents.toString(), result);
      done();
    });
  });

  it('should work without trailing coma', function (done) {
    var res = "template: `<h1>Test template</h1>`";
    var jsFile = new File({
      contents: new Buffer("templateUrl: 'template.html'")
    });

    var stream = inline(inlinerOptions);
    stream.write(jsFile);
    stream.once('data', function(file) {
      assert.equal(file.contents.toString(), res);
      done();
    });
  });

  it('should work with one-liner', function (done) {
    var res = "@View({template: `<h1>Test template</h1>`})";
    var jsFile = new File({
      contents: new Buffer("@View({templateUrl: 'template.html'})")
    });

    var stream = inline(inlinerOptions);
    stream.write(jsFile);
    stream.once('data', function(file) {
      assert.equal(file.contents.toString(), res);
      done();
    });
  });

  it('should still work with one-liner', function (done) {
    var res = "@View({template: `<h1>Test template</h1>`, directive: [NgIf]})";
    var jsFile = new File({
      contents: new Buffer("@View({templateUrl: 'template.html', directive: [NgIf]})")
    });

    var stream = inline(inlinerOptions);
    stream.write(jsFile);
    stream.once('data', function(file) {
      assert.equal(file.contents.toString(), res);
      done();
    });
  });

  it('should work with multiple lines', function (done) {
    var res = "@View({\ntemplate: `<p>\n  test\n</p>\n<p>\n  test\n</p>`,\ndirective: [NgIf]})";
    var jsFile = new File({
      contents: new Buffer("@View({\ntemplateUrl: 'multi-line.html',\ndirective: [NgIf]})")
    });

    var stream = inline(inlinerOptions);
    stream.write(jsFile);
    stream.once('data', function(file) {
      assert.equal(file.contents.toString(), res);
      done();
    });
  });

  it('should work with query string', function (done) {
    var res = "@View({\ntemplate: `<h1>Test template</h1>`,\ndirective: [NgIf]})";
    var jsFile = new File({
      contents: new Buffer("@View({\ntemplateUrl: 'template.html?version=1.0.0&ng=2',\ndirective: [NgIf]})")
    });

    var stream = inline(inlinerOptions);
    stream.write(jsFile);
    stream.once('data', function(file) {
      assert.equal(file.contents.toString(), res);
      done();
    });
  });

  it('should output es5 string when options.target = "es5"', function (done) {
    var options = extend({}, inlinerOptions, {
      target: 'es5'
    });

    var res = '@View({template: "<p>\n  test\n</p>\n<p>\n  test\n</p>", directive: [NgIf]})';
    var jsFile = new File({
      contents: new Buffer("@View({templateUrl: 'multi-line.html?version=1.0.0&ng=2', directive: [NgIf]})")
    });

    var stream = inline(options);
    stream.write(jsFile);
    stream.once('data', function(file) {
      assert.equal(file.contents.toString(), inlineFile(res));
      done();
    });
  });

  it('should work with options', function () {
    var options = extend({}, inlinerOptions, {
      quote: '"',
      extension: '.htm'
    });

    var jsFile = new File({
      contents: new Buffer('templateUrl: "template.htm",')
    });

    var stream = inline(options);
    stream.write(jsFile);
    stream.once('data', function(file) {
      assert.equal(file.contents.toString(), result);
      done();
    });
  });
});


function inlineFile(file) {
  return file.split('\n').join("\\n");
}

# gulp-inline-ng2-template

Inline Angular2 HTML and CSS files into JavaScript ES5/ES6 and TypeScript files (and possibly more - not tested).

[![Build Status](https://travis-ci.org/ludohenin/gulp-inline-ng2-template.svg?branch=master)](https://travis-ci.org/ludohenin/gulp-inline-ng2-template)
[![npm](https://img.shields.io/npm/dm/gulp-inline-ng2-template.svg?maxAge=2592000)](https://www.npmjs.com/package/gulp-inline-ng2-template)

This plugin uses the [ES6 template strings](https://github.com/lukehoban/es6features#template-strings) syntax by default _(which requires the use of a transpiler -typescript, babel, traceur- to produce valid ES5 files)_ but you can opt-in for ES5 one.

Very convenient to unit test your component or bundle your components/application (avoid extra HTTP request and keeps your source clean).

__note:__

* 4.0.0 -
  * Now escapes templates (html & css) backslashes. You may remove your custom workarounds if any
  * Proper error handling and propagation
* 3.0.0 - __Breaking changes__
  * Change processor function signature
* 2.0.0 - __Breaking changes__
  * Refactor the parser and make it async
  * `templateProcessor` and `styleProcessor` now accept a callback as 3rd argument
  * If you're not using the processor functions, everything will work as in 1.x.
* 1.1.5 adds `customFilePath` option
* 1.1.4 adds `supportNonExistentFiles` option
* 1.1.0 adds templateFunction when templateUrl is a function
* 1.0.0 - __Breaking changes__
  * Add suppport for processors (templates & styles)
  * Refactor configuration object (`html` and `css` prop dropped)
  * Drop jade dependency and related config
* 0.0.11 adds option to remove line breaks
* 0.0.10 adds components relative asset paths support (see Configuration)
* 0.0.8 adds Jade support (add `jade: true` to your config) => __dropped in 1.0.0__
* 0.0.6 adds support to style sheets

## TOC

* [Installation](#installation)
* [Configuration](#configuration)
  * [Options](#options)
  * [Processors configuration](#processors-configuration)
  * [Processor Examples](#processor-examples)
  * [Template function](#template-function)
  * [CustomFilePath configuration](#customfilepath-configuration)
* [Example usage](#example-usage)
* [Browserify transform example](#browserify-transform-example)
* [How it works](#how-it-works)
* [Contribute](#contribute)
* [Contributors](#contributors)
* [Todo](#todo)
* [Licence](#licence)

## Installation

```bash
npm install gulp-inline-ng2-template --save-dev
```

## Configuration

### Options

You can pass a configuration object to the plugin.
```javascript
defaults = {
  base: '/',                  // Angular2 application base folder
  target: 'es6',              // Can swap to es5
  indent: 2,                  // Indentation (spaces)
  useRelativePaths: false     // Use components relative assset paths
  removeLineBreaks: false     // Content will be included as one line
  templateExtension: '.html', // Update according to your file extension
  templateFunction: false,    // If using a function instead of a string for `templateUrl`, pass a reference to that function here
  templateProcessor: function (path, ext, file, callback) {/* ... */},
  styleProcessor: function (path, ext, file, callback) {/* ... */},
  customFilePath: function(ext, file) {/* ... */},
  supportNonExistentFiles: false // If html or css file do not exist just return empty content
};
```

### Processors configuration

```typescript
/**
 *  Processor function call signature and type return
 *
 * @Param{String}   file path
 * @Param{String}   file extension (type)
 * @Param{String}   file content
 * @Param{Function} callback function (err, result) => void
 * @Return{void}
 */
function processor(path, ext, file, cb) {
  // async implementation of your source files processing goes here ...
  cb(null, file);
}
```

### Processor Examples

Minify template file before inlining them

```javascript
import inlineTemplate from 'gulp-inline-ng2-template';
import htmlMinifier from 'html-minifier';

const pluginOptions = {
  base: mySrcPath,
  templateProcessor: minifyTemplate
};

function minifyTemplate(path, ext, file, cb) {
  try {
    var minifiedFile = htmlMinifier.minify(file, {
      collapseWhitespace: true,
      caseSensitive: true,
      removeComments: true,
      removeRedundantAttributes: true
    });
    cb(null, minifiedFile);
  }
  catch (err) {
    cb(err);
  }
}
```

_Credit [@lcrodriguez](https://github.com/lcrodriguez)_

### Template function

Inside your component: `templateUrl: templateFunc('app.html')`

```es6
/**
 *  Template function call signature and type return
 *
 * @Param{String}   filename
 * @Return{String}  returned filename
 */
templateFunction: function (filename) {
  // ...
  return newFilename;
}
```

### CustomFilePath configuration

```typescript
/**
 *  Custom function name call signature and type return
 *
 * @Param{String}   file extension (type)
 * @Param{String}   file path
 * @Return{String}  returned file path updated
 */
function customFilePath(ext, file) {
  return file;
}
```

## Example usage

```javascript
//...
var inlineNg2Template = require('gulp-inline-ng2-template');

var result = gulp.src('./app/**/*.ts')
  .pipe(inlineNg2Template({ base: '/app' }))
  .pipe(tsc());

return result.js
  .pipe(gulp.dest(PATH.dest));
```

## Browserify transform example

Example transform function to use with Browserify.

```javascript
// ng2inlinetransform.js
var ng2TemplateParser = require('gulp-inline-ng2-template/parser');
var through = require('through2');
var options = {target: 'es5'};

function (file) {
  return through(function (buf, enc, next){
    ng2TemplateParser({contents: buf, path: file}, options)((err, result) => {
      this.push(result);
      process.nextTick(next);
    });
  });
}
```

```javascript
// gulp task
return browserify('main.ts', {} )
  .add(config.angularApp.additionalFiles)
  .plugin(require('tsify'), {target: 'es5'})
  .transform('./ng2inlinetransform')
  .bundle()
  .pipe(gulp.dest(config.rootDirectory))
```

_Thanks to [@zsedem](https://github.com/zsedem)_

## How it works

__app.html__
```html
<p>
  Hello {{ world }}
</p>
```

__app.css__
```css
.hello {
  color: red;
}
```

__app.ts__
```javascript
import {Component, View} from 'angular2/angular2';
@Component({ selector: 'app' })
@View({
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  directives: [CORE_DIRECTIVES]
})
class AppCmp {}
```

__result (app.ts)__
```javascript
import {Component, View} from 'angular2/angular2';
@Component({ selector: 'app' })
@View({
  template: `
    <p>
      Hello {{ world }}
    </p>
  `,
  styles: [`
    .hello {
      color: red;
    }
  `],
  directives: [CORE_DIRECTIVES]
})
class AppCmp {}
```

## Contribute

```bash
git clone https://github.com/ludohenin/gulp-inline-ng2-template
cd gulp-inline-ng2-template
npm install
npm run test-dev
```

## Contributors

![Contributors](https://webtask.it.auth0.com/api/run/wt-ludovic_henin-yahoo_com-0/contributors-list/ludohenin/gulp-inline-ng2-template.svg)

## Todo

- [ ] Append styles into `styles` View config property if it exist
- [ ] Add support for source maps
- [ ] Add option `skipCommented`

## Licence

MIT

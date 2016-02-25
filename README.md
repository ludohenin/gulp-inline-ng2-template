# gulp-inline-ng2-template

Inline Angular2 HTML and CSS files into JavaScript ES5/ES6 and TypeScript files (and possibly more - not tested).

[![Build Status](https://travis-ci.org/ludohenin/gulp-inline-ng2-template.svg?branch=master)](https://travis-ci.org/ludohenin/gulp-inline-ng2-template)

This plugin uses the [ES6 template strings](https://github.com/lukehoban/es6features#template-strings) syntax by default _(which requires the use of a transpiler -typescript, babel, traceur- to produce valid ES5 files)_ but you can opt-in for ES5 one.

Very convenient to unit test your component or bundle your components/application (avoid extra HTTP request and keeps your source clean).

__note:__

* 1.1.0 adds templateFunction when templateUrl is a function
* 1.0.0 - __Breaking changes__
  * Add suppport for processors (templates & styles)
  * Refactor configuration object (`html` and `css` prop dropped)
  * Drop jade dependency and related config
* 0.0.11 adds option to remove line breaks
* 0.0.10 adds components relative asset paths support (see Configuration)
* 0.0.8 adds Jade support (add `jade: true` to your config) => __dropped in 1.0.0__
* 0.0.6 adds support to style sheets

# Installation

```bash
npm install gulp-inline-ng2-template --save-dev
```

# Configuration

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
  templateProcessor: function ...,
  styleProcessor:  function ...
};
```

## Preprocessors configuration

```typescript
/**
 *  Processor function call signature and type return
 *
 * @Param{String}   file extension (type)
 * @Param{String}   file content
 * @Return{String}  returned file to be inlined
 */
function processor(ext, file) {
  // sync implementation of your source files processing goes here ...
  return file;
}
```

## Template function

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

# Example usage

```javascript
//...
var inlineNg2Template = require('gulp-inline-ng2-template');

var result = gulp.src('./app/**/*.ts')
  .pipe(inlineNg2Template({ base: '/app' }))
  .pipe(tsc());

return result.js
  .pipe(gulp.dest(PATH.dest));
```

# How it works

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

# Test

```bash
git clone https://github.com/ludohenin/gulp-inline-ng2-template
cd gulp-inline-ng2-template
npm install
npm run test-dev
```

# Todo

- [ ] Append styles into `styles` View config property if it exist
- [ ] Add support for source maps
- [ ] Add option `skipCommented`

# Licence

MIT

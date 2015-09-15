# gulp-inline-ng2-template

Inline Angular2 HTML and CSS files into JavaScript ES5/ES6 and TypeScript files (and possibly more - not tested).
This plugin uses the [ES6 template strings](https://github.com/lukehoban/es6features#template-strings) syntax by default _(which requires the use of a transpiler -typescript, babel, traceur- to produce valid ES5 files)_ but you can opt-in for ES5 one.

Very convenient to unit test your component or bundle your components/application (avoid extra HTTP request and keeps your source clean).

__note:__ 0.0.6 adds support to style sheets

# Installation

```bash
npm install gulp-inline-ng2-template --save-dev
```

# Configuration

You can pass a configuration object to the plugin.
```javascript
defaults = {
  base: '/',          // Angular2 application base folder
  html: true,         // Process .html files
  css: true,          // Process .css files
  target: 'es6'       // Can swap to es5
  indent: 2           // Indentation (spaces)
};
```
_HTML extension is currently hard coded to .html_

# Example usage

```javascript
//...
var inlineNg2Template = require('gulp-inline-ng2-template');

var result = gulp.src('./app/**/*ts')
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
@Component({ selector: 'hello' })
@View({
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  directives: [CORE_DIRECTIVES]
})
class Hello {}
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
class Hello {}
```

# Test

```bash
git clone https://github.com/ludohenin/gulp-inline-ng2-template
cd gulp-inline-ng2-template
npm install
npm run test-dev
```

# Licence

MIT

#gulp-inline-ng2-template
Inline Angular2 template file into JavaScript ES5/ES6 and TypeScript files (and possibly more - not tested).
This plugin uses the [ES6 template strings](https://github.com/lukehoban/es6features#template-strings) syntax by default _(which requires the use of a transpiler -typescript, babel, traceur- to produce valid ES5 files)_ but you can opt-in for ES5 one.

This is very convenient to unit test your component or bundle your components/application (avoid extra HTTP request and keeps your source clean).

#Installation
```bash
npm install gulp-inline-ng2-template --save-dev
```

#Configuration
You can pass a configuration object to the plugin.
```javascript
defaults = {
  base: '/',          // Angular2 source base folder
  extension: '.html', // Template file extension
  quote: "'",         // Angular2 component config object property wrapping quote
  target: 'es6'       // Can swap to es5
};
```

#Example usage
```javascript
//...
var inlineNg2Template = require('gulp-inline-ng2-template');

var result = gulp.src('./app/**/*ts')
  .pipe(inlineNg2Template({
    base: '/app'
  }))
  .pipe(tsc());

return result.js
  .pipe(gulp.dest(PATH.dest));
```

#How it works
__template.html__
```html
<h1>Hello {{ world }}</h1>
```

__component.ts__
```javascript
import {Component, View} from 'angular2/angular2';
@Component({ selector: 'hello' })
@View({ templateUrl: './template.html'})
class Hello {}
```

__result (component.ts)__
```javascript
import {Component, View} from 'angular2/angular2';
@Component({ selector: 'hello' })
@View({ template: `<h1>Hello {{ world }}</h1>`})
class Hello {}
```

#Licence
MIT

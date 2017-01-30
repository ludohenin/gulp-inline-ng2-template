// TEST_1
@Component({
  selector: 'app',
  moduleId: module.id
})
@View({
  template: `
    <h1>Test</h1>

    <p>
      Test
    </p>
  `,
  styles: [`
    .test {
      color: red;
    }
    smile:before {
      content: "\\000B";
    }
  `],
  directives: [CORE_DIRECTIVES]
})
export class App {}

// TEST_2
@Component({
  selector: 'app'
})
@View({
  template: `
    <h1>Test</h1>

    <p>
      Test
    </p>
  `,
  styles: [`
    .test {
      color: red;
    }
    smile:before {
      content: "\\000B";
    }
  `]
})
export class App {}

// TEST_3
@Component({
  selector: 'app'
})
@View({
  template: `
    <h1>Test</h1>

    <p>
      Test
    </p>
  `,
  styles: [`
    .test {
      color: red;
    }
    smile:before {
      content: "\\000B";
    }
    .common {
      color: grey;
    }
  `],
  directives: [CORE_DIRECTIVES]
})
export class App {}

// TEST_4
@Component({
  selector: 'app'
})
@View({
  template: `
    <h1>Test</h1>

    <p>
      Test
    </p>
  `,
  styles: [`
    .test {
      color: red;
    }
    smile:before {
      content: "\\000B";
    }
    .common {
      color: grey;
    }
    .test {
      color: red;
    }
    smile:before {
      content: "\\000B";
    }
    .common {
      color: grey;
    }
  `],
  directives: [CORE_DIRECTIVES]
})
export class App {}

// TEST_5
@Component({
  selector: 'app'
})
@View({
  template: `
    <h1>Test</h1>

    <p>
      Test
    </p>
  `,
  styles: [`
    .test {
      color: red;
    }
    smile:before {
      content: "\\000B";
    }
    .common {
      color: grey;
    }
  `],
  directives: [CORE_DIRECTIVES]
})
export class App {}

// TEST_6
@Component({
  selector: 'app'
})
@View({ template: `
  <h1>Test</h1>

  <p>
    Test
  </p>
`, styles: [`
  .test {
    color: red;
  }
  smile:before {
    content: "\\000B";
  }
  .common {
    color: grey;
  }
`] })
export class App {}

// TEST_7
@Component({
  selector: 'app'
})
@View({ template: `
  <h1>Test</h1>

  <p>
    Test
  </p>
`, styles: [`
  .test {
    color: red;
  }
  smile:before {
    content: "\\000B";
  }
  .common {
    color: grey;
  }
`], directives: [CORE_DIRECTIVES] })
export class App {}

// TEST_8
@Component({
  selector: 'app'
})
@View({ template: `
  <h1>Test</h1>

  <p>
    Test
  </p>
`,
  styles: [`
    .test {
      color: red;
    }
    smile:before {
      content: "\\000B";
    }
    .common {
      color: grey;
    }
  `], directives: [CORE_DIRECTIVES] })
export class App {}

// TEST_9
import {Component, View, bootstrap} from 'angular2/angular2';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_BINDINGS} from 'angular2/router';
// import {HTTP_BINDINGS} from 'http/http';

import {Home} from './components/home/home';
import {About} from './components/about/about';
import {NamesList} from './services/NameList';

@Component({
  selector: 'app',
  viewBindings: [Service]
})
@RouteConfig([
  { path: '/', component: Home, as: 'home' },
  { path: '/about', component: About, as: 'about' }
])
@View({
  template: `
    <section class="sample-app-content">
      <nav>
        <a [router-link]="['/home']">Home</a>
        <a [router-link]="['/about']">About</a>
      </nav>

      <router-outlet></router-outlet>
    </section>
  `,
  styles: [`
    .sample-app-content {
      font-family: Verdana;
    }
    .sample-app-content h1 {
      color: #999999;
      font-size: 3em;
    }
    .sample-app-content h2 {
      color: #990000;
      font-size: 2em;
    }
    .sample-app-content p,
    .sample-app-content nav {
      padding: 30px;
    }
    .sample-app-content li,
    .sample-app-content p {
      font-size: 1.2em;
    }
    .sample-app-content li {
      font-family: Consolas;
    }
    .sample-app-content nav a {
      display: inline-block;
      margin-right: 15px;
    }
    .sample-app-content input,
    .sample-app-content button {
      padding: 5px;
      font-size: 1em;
      outline: none;
    }
  `],
  directives: [CORE_DIRECTIVES]
})
export class App {}

// Test 10
export class App {
  array = [1,2,3,4,5];

  get() {
    return this.array;
  }
  add(value) {
    this.array.push(value);
  }
}

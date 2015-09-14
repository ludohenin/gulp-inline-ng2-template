// TEST_1
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
    .common {
      color: grey;
    }
    .test {
      color: red;
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
    <h1>Test</h1>

    <p>
      Test
    </p>
  `,
  styles: [`
    .test {
      color: red;
    }
  `],
  directives: [CORE_DIRECTIVES]
})
export class App {}

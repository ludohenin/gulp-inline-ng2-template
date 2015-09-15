// TEST_1
@Component({
  selector: 'app'
})
@View({
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  directives: [CORE_DIRECTIVES]
})
export class App {}

// TEST_2
@Component({
  selector: 'app'
})
@View({
  templateUrl: './app.html',
  styleUrls: [
    './app.css'
  ]
})
export class App {}

// TEST_3
@Component({
  selector: 'app'
})
@View({
  templateUrl: './app.html',
  styleUrls: [
    './app.css',
    './common.css'
  ],
  directives: [CORE_DIRECTIVES]
})
export class App {}

// TEST_4
@Component({
  selector: 'app'
})
@View({
  templateUrl: './app.html',
  styleUrls: [
    './app.css',
    './common.css',
    './app.css',
    './common.css'
  ],
  directives: [CORE_DIRECTIVES]
})
export class App {}

// TEST_5
@Component({
  selector: 'app'
})
@View({
  templateUrl: './app.html',
  styleUrls: ['./app.css', './common.css'],
  directives: [CORE_DIRECTIVES]
})
export class App {}

// TEST_6
@Component({
  selector: 'app'
})
@View({ templateUrl: './app.html', styleUrls: ['./app.css', './common.css'] })
export class App {}

// TEST_7
@Component({
  selector: 'app'
})
@View({ templateUrl: './app.html', styleUrls: ['./app.css', './common.css'], directives: [CORE_DIRECTIVES] })
export class App {}

// TEST_8
@Component({
  selector: 'app'
})
@View({ templateUrl: './app.html',
  styleUrls: ['./app.css', './common.css'], directives: [CORE_DIRECTIVES] })
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
  templateUrl: './app2.html',
  styleUrls: ['./app2.css'],
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

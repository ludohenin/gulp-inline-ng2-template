// TEST_1
@Component({
  selector: 'app'
})
@View({
  templateUrl: './app.jade',
  styleUrls: ['./app.css'],
  directives: [CORE_DIRECTIVES]
})
export class App {}

// TEST_2
@Component({
  selector: 'app'
})
@View({
  templateUrl: './app.jade',
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
  templateUrl: './app.jade',
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
  templateUrl: './app.jade',
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
  templateUrl: './app.jade',
  styleUrls: ['./app.css', './common.css'],
  directives: [CORE_DIRECTIVES]
})
export class App {}

// TEST_6
@Component({
  selector: 'app'
})
@View({ templateUrl: './app.jade', styleUrls: ['./app.css', './common.css'] })
export class App {}

// TEST_7
@Component({
  selector: 'app'
})
@View({ templateUrl: './app.jade', styleUrls: ['./app.css', './common.css'], directives: [CORE_DIRECTIVES] })
export class App {}

// TEST_8
@Component({
  selector: 'app'
})
@View({ templateUrl: './app.jade',
  styleUrls: ['./app.css', './common.css'], directives: [CORE_DIRECTIVES] })
export class App {}

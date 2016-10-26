// TEST 1
@Component({
  selector: "app",
  template: "\n    <h1>Test</h1>\n\n    <p>\n      You have ${{amount}} dollars.\n    </p>\n  ",
  directives: [CORE_DIRECTIVES]
})
export class App {}

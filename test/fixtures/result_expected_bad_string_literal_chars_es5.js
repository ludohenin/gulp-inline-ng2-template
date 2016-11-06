// TEST 1
@Component({
  selector: "app",
  template: "\n    <h1>Test</h1>\n\n    <p>\n      You have ${{amount}} dollars.\n    </p>\n\n    <input name=\"number\" pattern=\"\\d+\" />\n\n    The ` character is great.\n  ",
  styles: ["\n    body:before {\n      content: \"You have ${amount} dollars.\"\n    }\n\n    body:after {\n      content: \"\\d+ is a regular expression.\"\n    }\n\n    html:after {\n      content: \"The ` character is great.\"\n    }\n  "],
  directives: [CORE_DIRECTIVES]
})
export class App {}

// TEST 1
@Component({
  selector: "app",
  template: `
    <h1>Test</h1>

    <p>
      You have \${{amount}} dollars.
    </p>

    <input name="number" pattern="\\d+" />

    The \` character is great.
  `,
  styles: [`
    body:before {
      content: "You have \${amount} dollars."
    }

    body:after {
      content: "\\d+ is a regular expression."
    }

    html:after {
      content: "The \` character is great."
    }
  `],
  directives: [CORE_DIRECTIVES]
})
export class App {}

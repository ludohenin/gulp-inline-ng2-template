// TEST 1
@Component({
  selector: "app",
  template: `
    <h1>Test</h1>

    <p>
      You have \${{amount}} dollars.
    </p>
  `,
  directives: [CORE_DIRECTIVES]
})
export class App {}

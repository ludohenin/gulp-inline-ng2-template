// TEST 1
@Component({
  selector: "app",
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

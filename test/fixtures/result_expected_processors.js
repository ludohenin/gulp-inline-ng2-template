// TEST_1
@Component({
  selector: 'app'
})
@View({
  template: `
    <h1>Test</h1><p>Test</p>
  `,
  styles: [`
    .test {
      color: #f00;
    }
    smile:before {
      content: "\\000B";
    }
    .common {
      color: #808080;
    }
  `],
  directives: [CORE_DIRECTIVES]
})
export class App {}

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
      color: red;
    }
    .common {
      color: grey;
    }
  `],
  directives: [CORE_DIRECTIVES]
})
export class App {}

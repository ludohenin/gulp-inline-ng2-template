// TEST_1
@Component({
  selector: 'app'
})
@View({
  template: `
    <h1>Test</h1>
    <!-- This is a comment with
    \`\`\`javascript
    multipleBackticks()
    \`\`\`
    in it -->
    <p>
      Test
    </p>
  `,
  styles: [`
    .test {
      color: red;
    }
    /* This is a comment with \`backticks\` in it. */
    smile:before {
      content: "\\000B";
    }
  `],
  directives: [CORE_DIRECTIVES]
})
export class App {}

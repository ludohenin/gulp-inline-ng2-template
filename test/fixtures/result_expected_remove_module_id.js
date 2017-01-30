// TEST 1
@Component({
  selector: 'standard-module-id',
  template: `
    <h1>Test</h1>

    <p>
      Test
    </p>
  `
})
export class StandardModuleId {}

// TEST 2
@Component({
  selector: 'multiline-module-id',
  template: `
    <h1>Test</h1>

    <p>
      Test
    </p>
  `
})
export class MultilineModuleId {}

// TEST 3
@Component({
  selector: 'module-id-no-trailing-comma',
})
export class LastPropertyModuleId {}

// TEST 4
@Component({
  selector: 'string module id',
})
export class StringModuleId {}

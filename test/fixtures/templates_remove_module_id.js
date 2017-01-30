// TEST 1
@Component({
  selector: 'standard-module-id',
  moduleId: module.id,
  templateUrl: 'app.html'
})
export class StandardModuleId {}

// TEST 2
@Component({
  selector: 'multiline-module-id',
  moduleId:
      module.id
  ,
  templateUrl: 'app.html'
})
export class MultilineModuleId {}

// TEST 3
@Component({
  selector: 'module-id-no-trailing-comma',
  moduleId: module.id
})
export class LastPropertyModuleId {}

// TEST 4
@Component({
  selector: 'string module id',
  moduleId: 'path/to/module.ts'
})
export class StringModuleId {}

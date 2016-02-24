// TEST_1
@Component({
  selector: 'app'
})
@View({
  templateUrl: viewFunction('./app.html'),
  directives: [CORE_DIRECTIVES]
})
export class App {}

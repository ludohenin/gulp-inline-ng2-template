// TEST_1
@Component({
  selector: 'app'
})
@View({
  templateUrl: './app_nonexistent.html',
  styleUrls: ['./app_nonexistent.stylus', './common_nonexistent.stylus'],
  directives: [CORE_DIRECTIVES]
})
export class App {}

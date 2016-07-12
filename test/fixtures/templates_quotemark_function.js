// TEST 1
@Component({
  selector: "app",
  templateUrl: viewFunction("./app.html"),
  styleUrls: [
    viewFunction("./app.css"),
    viewFunction("./common.css")],
  directives: [CORE_DIRECTIVES]
})
export class App {}

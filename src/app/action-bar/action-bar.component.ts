import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.scss']
})
export class ActionBarComponent implements OnInit {

  @Input() showResult;
  @Output() toggleHeaderDialog = new EventEmitter();
  @Output() toggleVariableDialog = new EventEmitter();
  @Output() toggleResult = new EventEmitter();
  @Output() prettifyCodeChange = new EventEmitter();
  @Output() sendRequest = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  prettifyCode() {
    this.prettifyCodeChange.next();
  }

}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  @Input() showDialog = false;
  @Input() heading = '[DIALOG_HEADING]';
  @Input() subheading = '[DIALOG_SUBHEADING]';
  @Input() showFooter = true;
  @Output() toggleDialog = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

}

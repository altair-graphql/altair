import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import * as fromVariables from 'app/store/variables/variables.reducer';

// TODO: Will have functionality to switch between single and multiple mode
// TODO: Will have multiple input file support
// TODO: Will show warning if single file variable contains multiple files
// TODO: Will show error if invalid file

@Component({
  selector: 'app-variable-file-item',
  templateUrl: './variable-file-item.component.html',
  styles: [
  ]
})
export class VariableFileItemComponent implements OnInit {

  @Input() fileVariable: fromVariables.FileVariable;

  @Output() fileVariableNameChange = new EventEmitter();
  @Output() fileVariableDataChange = new EventEmitter();
  @Output() deleteFileVariableChange = new EventEmitter();

  @ViewChild('fileEl', { static: true }) fileEl: ElementRef<HTMLInputElement>;

  constructor() { }

  ngOnInit(): void {
  }

  onSelectFiles() {
    const files = this.fileEl.nativeElement.files;
    if (!files) {
      return;
    }

    return this.fileVariableDataChange.emit(Array.from(files));
  }
}

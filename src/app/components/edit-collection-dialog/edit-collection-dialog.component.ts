import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-edit-collection-dialog',
  templateUrl: './edit-collection-dialog.component.html',
  styleUrls: ['./edit-collection-dialog.component.scss']
})
export class EditCollectionDialogComponent implements OnInit {

  @Input() showEditCollectionDialog = true;
  @Input() collection = null;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() importCurlChange = new EventEmitter<string>();
  @Output() updateCollectionChange = new EventEmitter<{ collection }>();

  constructor() { }

  ngOnInit() {
  }

  updateCollection() {
    this.toggleDialogChange.next(false);
    this.updateCollectionChange.next({ collection: this.collection });
  }
}

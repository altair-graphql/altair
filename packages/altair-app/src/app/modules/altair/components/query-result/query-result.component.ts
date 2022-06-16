import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  OnChanges,
  ElementRef,
  SimpleChanges,
} from '@angular/core';

import isElectron from 'altair-graphql-core/build/utils/is_electron';
import { SubscriptionResponse } from 'altair-graphql-core/build/types/state/query.interfaces';
import { AltairPanel } from 'altair-graphql-core/build/plugin/panel';
import { TrackByIdItem } from '../../interfaces/shared';
import { EditorState, Extension } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { indentUnit } from '@codemirror/language';

@Component({
  selector: 'app-query-result',
  templateUrl: './query-result.component.html',
  styleUrls: ['./query-result.component.scss'],
})
export class QueryResultComponent implements OnChanges {
  @Input() queryResult = '';
  @Input() responseTime = 0;
  @Input() responseStatus = 0;
  @Input() responseStatusText = '';
  @Input() responseHeaders = {};
  @Input() isSubscribed = false;
  @Input() subscriptionResponses: SubscriptionResponse[] = [];
  @Input() subscriptionUrl = '';
  @Input() tabSize = 2;
  @Input() autoscrollSubscriptionResponses = false;
  @Input() windowId = '';
  @Input() activeWindowId = '';
  @Input() uiActions = [];
  @Input() bottomPanels = [];

  @Output() downloadResultChange = new EventEmitter();
  @Output() clearResultChange = new EventEmitter();
  @Output() stopSubscriptionChange = new EventEmitter();
  @Output() clearSubscriptionChange = new EventEmitter();
  @Output() autoscrollSubscriptionResponsesChange = new EventEmitter();
  @Output() uiActionExecuteChange = new EventEmitter();
  @Output() bottomPanelActiveToggle = new EventEmitter<AltairPanel>();

  @ViewChild('subscriptionResponseList', { static: true })
  subscriptionResponseList: ElementRef;

  isElectron = isElectron;

  selectedIndex = 0;

  editorExtensions: Extension[] = [
    json(),
    EditorState.readOnly.of(true),
    indentUnit.of(' '.repeat(this.tabSize)),
    EditorState.tabSize.of(this.tabSize),
  ];

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.subscriptionResponses?.currentValue) {
      const scrollTopTimeout = setTimeout(() => {
        if (
          this.subscriptionResponseList &&
          this.autoscrollSubscriptionResponses
        ) {
          this.subscriptionResponseList.nativeElement.scrollTop =
            this.subscriptionResponseList.nativeElement.scrollHeight;
        }
        clearTimeout(scrollTopTimeout);
      }, 50);
    }

    if (changes?.isSubscribed) {
      if (changes.isSubscribed.currentValue) {
        // select subscription result tab is subscribed
        this.selectedIndex = 1;
      } else {
        // if unsubscribed and no subscription result yet, select initial tab instead
        if (!this.subscriptionResponses.length) {
          this.selectedIndex = 0;
        }
      }
    }
  }

  subscriptionResponseTrackBy(index: number, response: SubscriptionResponse) {
    return response.responseTime;
  }

  togglePanelActive(panel: AltairPanel) {
    this.bottomPanelActiveToggle.emit(panel);
  }

  trackById(index: number, item: TrackByIdItem) {
    return item.id;
  }
}

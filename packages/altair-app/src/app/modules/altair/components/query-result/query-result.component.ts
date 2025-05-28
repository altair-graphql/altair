import {
  Component,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
} from '@angular/core';

import isElectron from 'altair-graphql-core/build/utils/is_electron';
import {
  LogLine,
  QueryResponse,
} from 'altair-graphql-core/build/types/state/query.interfaces';
import { AltairPanel } from 'altair-graphql-core/build/plugin/panel';
import { TrackByIdItem } from '../../interfaces/shared';
import { EditorState, Extension } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { indentUnit } from '@codemirror/language';
import { AltairUiAction } from 'altair-graphql-core/build/plugin/ui-action';
import { IDictionary } from 'altair-graphql-core/build/types/shared';
import { ResizeEvent } from 'angular-resizable-element';

@Component({
  selector: 'app-query-result',
  templateUrl: './query-result.component.html',
  styleUrls: ['./query-result.component.scss'],
})
export class QueryResultComponent implements AfterViewInit {
  @Input() responseTime = 0;
  @Input() responseStatus = 0;
  @Input() responseStatusText = '';
  @Input() responseHeaders: IDictionary<string> = {};
  @Input() requestScriptLogs: LogLine[] = [];
  @Input() isRunning = false;
  @Input() isSubscribed = false;
  @Input() queryResponses: QueryResponse[] = [];
  @Input() subscriptionUrl = '';
  @Input() tabSize = 2;
  @Input() autoscrollResponseList = true;
  @Input() windowId = '';
  @Input() activeWindowId = '';
  @Input() uiActions: AltairUiAction[] = [];
  @Input() bottomPanels: AltairPanel[] = [];

  @Output() downloadResultChange = new EventEmitter<string>();
  @Output() clearResultChange = new EventEmitter();
  @Output() cancelRequestChange = new EventEmitter();
  @Output() autoscrollResponseListChange = new EventEmitter();
  @Output() uiActionExecuteChange = new EventEmitter();
  @Output() bottomPanelActiveToggle = new EventEmitter<AltairPanel>();

  @ViewChild('queryResultList', { static: false })
  queryResultList?: ElementRef;

  @ViewChildren('queryResultItem') queryResultItems?: QueryList<unknown>;

  isElectron = isElectron;

  selectedIndex = 0;

  editorExtensions: Extension[] = [
    json(),
    EditorState.readOnly.of(true),
    indentUnit.of(' '.repeat(this.tabSize)),
    EditorState.tabSize.of(this.tabSize),
  ];

  bottomPaneHeight = '50%';

  ngAfterViewInit(): void {
    this.queryResultItems?.changes.subscribe(() => this.onItemElementsChanged());
  }

  togglePanelActive(panel: AltairPanel) {
    this.bottomPanelActiveToggle.emit(panel);
  }

  trackById(index: number, item: TrackByIdItem) {
    return item.id;
  }
  private onItemElementsChanged(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.queryResultList && this.autoscrollResponseList) {
        const scrollTop = this.queryResultList.nativeElement.scrollHeight + 50;
        this.queryResultList.nativeElement.scroll({
          top: scrollTop,
          left: 0,
          behavior: 'smooth',
        });
      }
    }, 50);
  }

  hasActiveBottomPanel(): boolean {
    return this.bottomPanels.some((panel) => panel.isActive);
  }

  // using arrow function, as it seems the this context in angular-resize-element is changed
  validate = (event: ResizeEvent): boolean => {
    const MIN_DIMENSIONS_PX = 50;
    if (!this.hasActiveBottomPanel()) {
      // If no bottom panels are active, don't allow resizing
      return false;
    }

    if (event.rectangle.height && event.rectangle.height < MIN_DIMENSIONS_PX) {
      return false;
    }
    return true;
  };

  onResizeEnd(event: ResizeEvent): void {
    const height = event.rectangle.height;

    if (height) {
      this.bottomPaneHeight = `${height}px`;
    }
  }
}

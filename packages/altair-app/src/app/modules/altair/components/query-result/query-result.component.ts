import {
  Component,
  Output,
  ViewChild,
  EventEmitter,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
  ChangeDetectionStrategy,
  input,
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
import { parseJson } from '../../utils';

@Component({
  selector: 'app-query-result',
  templateUrl: './query-result.component.html',
  styleUrls: ['./query-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class QueryResultComponent implements AfterViewInit {
  readonly responseTime = input(0);
  readonly responseStatus = input(0);
  readonly responseStatusText = input('');
  readonly responseHeaders = input<IDictionary<string>>({});
  readonly requestScriptLogs = input<LogLine[]>([]);
  readonly isRunning = input(false);
  readonly isSubscribed = input(false);
  readonly queryResponses = input<QueryResponse[]>([]);
  readonly subscriptionUrl = input('');
  readonly tabSize = input(2);
  readonly autoscrollResponseList = input(true);
  readonly windowId = input('');
  readonly activeWindowId = input('');
  readonly uiActions = input<AltairUiAction[]>([]);
  readonly bottomPanels = input<AltairPanel[]>([]);
  readonly hideExtensions = input(false);

  @Output() downloadResultChange = new EventEmitter<string>();
  @Output() clearResultChange = new EventEmitter();
  @Output() cancelRequestChange = new EventEmitter();
  @Output() autoscrollResponseListChange = new EventEmitter();
  @Output() uiActionExecuteChange = new EventEmitter();
  @Output() bottomPanelActiveToggle = new EventEmitter<AltairPanel>();

  // eslint-disable-next-line @angular-eslint/prefer-signals
  @ViewChild('queryResultList', { static: false })
  queryResultList?: ElementRef;

  // eslint-disable-next-line @angular-eslint/prefer-signals
  @ViewChildren('queryResultItem') queryResultItems?: QueryList<unknown>;

  isElectron = isElectron;

  selectedIndex = 0;

  editorExtensions: Extension[] = [
    json(),
    EditorState.readOnly.of(true),
    indentUnit.of(' '.repeat(this.tabSize())),
    EditorState.tabSize.of(this.tabSize()),
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

  getItemContent(item: QueryResponse): string {
    if (item.json) {
      // attempt to parse the response body as JSON
      const parsedContent = item.content
        ? parseJson(item.content, item.content)
        : undefined;

      if (parsedContent?.extensions && this.hideExtensions()) {
        // If extensions are present and hideExtensions is true, remove them
        Reflect.deleteProperty(parsedContent, 'extensions');
      }

      return JSON.stringify(parsedContent, null, this.tabSize());
    }
    return item.content;
  }

  private onItemElementsChanged(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.queryResultList && this.autoscrollResponseList()) {
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
    return this.bottomPanels().some((panel) => panel.isActive);
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

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { json } from '@codemirror/lang-json';
import { Extension } from '@codemirror/state';
import {
  HTTP_HANDLER_ID,
  RequestHandlerData,
  RequestHandlerIds,
} from 'altair-graphql-core/build/request/types';
import { RequestHandlerInfo } from 'altair-graphql-core/build/types/state/query.interfaces';

@Component({
  selector: 'app-request-handler-dialog',
  templateUrl: './request-handler-dialog.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class RequestHandlerDialogComponent {
  @Input() requestHandlerId: RequestHandlerIds = HTTP_HANDLER_ID;
  @Input() requestHandlerAdditionalParams = '{}';
  @Input() subscriptionUrl = '';
  @Input() subscriptionConnectionParams = '';
  @Input() subscriptionUseDefaultRequestHandler = false;
  @Input() selectedSubscriptionRequestHandlerId?: RequestHandlerIds;
  @Input() requestHandlers: RequestHandlerData[] = [];
  @Input() showDialog = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() requestHandlerInfoChange = new EventEmitter<RequestHandlerInfo>();

  connectionParamsExtensions: Extension[] = [json()];

  updateRequestHandlerInfo(data: Partial<RequestHandlerInfo>) {
    this.requestHandlerInfoChange.emit(data);
  }

  trackById(index: number, item: RequestHandlerData) {
    return item.id;
  }
}

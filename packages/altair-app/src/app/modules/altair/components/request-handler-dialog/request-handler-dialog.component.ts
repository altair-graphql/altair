import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { json } from '@codemirror/lang-json';
import { Extension } from '@codemirror/state';
import {
  HTTP_HANDLER_ID,
  RequestHandlerData,
  RequestHandlerIds,
  WEBSOCKET_HANDLER_ID,
} from 'altair-graphql-core/build/request/types';
import { RequestHandlerInfo } from 'altair-graphql-core/build/types/state/query.interfaces';

@Component({
  selector: 'app-request-handler-dialog',
  templateUrl: './request-handler-dialog.component.html',
  styles: ``,
})
export class RequestHandlerDialogComponent implements OnInit, OnChanges {
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

  handlerInfo: RequestHandlerInfo = {
    additionalParams: '{}',
    requestHandlerId: HTTP_HANDLER_ID,
    subscriptionRequestHandlerId: WEBSOCKET_HANDLER_ID,
    subscriptionUrl: '',
    subscriptionUseDefaultRequestHandler: false,
    subscriptionConnectionParams: '',
  };

  ngOnInit() {
    this.buildRequestHandlerInfo();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes?.requestHandlerId?.currentValue ||
      changes?.selectedSubscriptionRequestHandlerId?.currentValue
    ) {
      this.buildRequestHandlerInfo();
    }
  }
  buildRequestHandlerInfo() {
    this.handlerInfo = {
      requestHandlerId: this.requestHandlerId,
      additionalParams: this.requestHandlerAdditionalParams,
      subscriptionUseDefaultRequestHandler:
        this.subscriptionUseDefaultRequestHandler,
      subscriptionUrl: this.subscriptionUrl,
      subscriptionConnectionParams: this.subscriptionConnectionParams,
      subscriptionRequestHandlerId: this.selectedSubscriptionRequestHandlerId,
    };
  }

  updateRequestHandlerInfo(data: Partial<RequestHandlerInfo>) {
    this.handlerInfo = {
      ...this.handlerInfo,
      ...data,
    };
    this.requestHandlerInfoChange.emit(this.handlerInfo);
  }

  trackById(index: number, item: RequestHandlerData) {
    return item.id;
  }
}

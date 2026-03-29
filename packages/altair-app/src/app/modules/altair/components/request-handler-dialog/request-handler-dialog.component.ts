import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { json } from '@codemirror/lang-json';
import { Extension } from '@codemirror/state';
import { HTTP_HANDLER_ID } from 'altair-graphql-core/build/request/ids';
import {
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
  readonly requestHandlerId = input<RequestHandlerIds>(HTTP_HANDLER_ID);
  readonly requestHandlerAdditionalParams = input('{}');
  readonly subscriptionUrl = input('');
  readonly subscriptionConnectionParams = input('');
  readonly subscriptionUseDefaultRequestHandler = input(false);
  readonly selectedSubscriptionRequestHandlerId = input<RequestHandlerIds>();
  readonly requestHandlers = input<RequestHandlerData[]>([]);
  readonly showDialog = input(false);
  readonly toggleDialogChange = output<boolean>();
  readonly requestHandlerInfoChange = output<RequestHandlerInfo>();

  connectionParamsExtensions: Extension[] = [json()];

  updateRequestHandlerInfo(data: Partial<RequestHandlerInfo>) {
    this.requestHandlerInfoChange.emit(data);
  }

  trackById(index: number, item: RequestHandlerData) {
    return item.id;
  }
}

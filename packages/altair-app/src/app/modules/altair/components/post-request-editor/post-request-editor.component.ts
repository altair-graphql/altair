import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PostrequestState } from 'altair-graphql-core/build/types/state/postrequest.interfaces';
import { PreRequestService } from '../../services';
import { getRequestScriptExtensions } from '../../utils/editor/extensions';
import { getGlobalContext } from 'altair-graphql-core/build/script/context';

const AUTOCOMPLETE_CHARS = /^[a-zA-Z0-9_]$/;

@Component({
  selector: 'app-post-request-editor',
  templateUrl: './post-request-editor.component.html',
  styles: [],
})
export class PostRequestEditorComponent {
  @Input() postRequest: PostrequestState = {
    enabled: false,
    script: '',
  };
  @Output() postRequestScriptChange = new EventEmitter();
  @Output() postRequestEnabledChange = new EventEmitter();

  editorExtensions = getRequestScriptExtensions(
    getGlobalContext(
      {
        headers: [],
        environment: {},
        operationName: '',
        query: '',
        variables: '',
        url: '',
        requestExtensions: '',
      },
      {
        setCookie: async () => {},
        getStorageItem: async () => {},
        setStorageItem: async () => {},
        request: async () => {},
      }
    )
  );

  constructor(private preRequestService: PreRequestService) {}
}

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { PostrequestState } from 'altair-graphql-core/build/types/state/postrequest.interfaces';
import { getRequestScriptExtensions } from '../../utils/editor/extensions';
import { getGlobalContext } from 'altair-graphql-core/build/script/context';

@Component({
  selector: 'app-post-request-editor',
  templateUrl: './post-request-editor.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
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
}

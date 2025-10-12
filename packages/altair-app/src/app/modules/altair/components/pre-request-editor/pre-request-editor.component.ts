import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

import { PrerequestState } from 'altair-graphql-core/build/types/state/prerequest.interfaces';
import { getRequestScriptExtensions } from '../../utils/editor/extensions';
import { getGlobalContext } from 'altair-graphql-core/build/script/context';

@Component({
  selector: 'app-pre-request-editor',
  templateUrl: './pre-request-editor.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PreRequestEditorComponent {
  readonly preRequest = input<PrerequestState>({
    enabled: false,
    script: '',
});
  readonly preRequestScriptChange = output();
  readonly preRequestEnabledChange = output();

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

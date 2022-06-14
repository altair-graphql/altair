import {
  Component,
  EventEmitter,
  Input,
  Output} from '@angular/core';

import { PrerequestState } from 'altair-graphql-core/build/types/state/prerequest.interfaces';
import { getRequestScriptExtensions } from '../../utils/editor/extensions';
import { PreRequestService } from '../../services';

const AUTOCOMPLETE_CHARS = /^[a-zA-Z0-9_]$/;

@Component({
  selector: 'app-pre-request-editor',
  templateUrl: './pre-request-editor.component.html',
  styles: []
})
export class PreRequestEditorComponent {

  @Input() preRequest: PrerequestState = {
    enabled: false,
    script: '',
  };
  @Output() preRequestScriptChange = new EventEmitter();
  @Output() preRequestEnabledChange = new EventEmitter();

  editorExtensions = getRequestScriptExtensions(this.preRequestService.getGlobalContext({
    headers: [],
    environment: {},
    query: '',
    variables: '',
  }));

  constructor(
    private preRequestService: PreRequestService,
  ) {}
}

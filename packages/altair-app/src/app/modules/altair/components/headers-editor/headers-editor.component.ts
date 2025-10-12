import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';
import { HeaderState } from 'altair-graphql-core/build/types/state/header.interfaces';
import { isElectronApp } from '../../utils';

@Component({
  selector: 'app-headers-editor',
  templateUrl: './headers-editor.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class HeadersEditorComponent {
  readonly headers = input<HeaderState>([]);

  readonly headerEnabledChange = output<{
    index: number;
    enabled: boolean;
}>();
  readonly headerKeyChange = output<{
    index: number;
    key: string;
}>();
  readonly headerValueChange = output<{
    index: number;
    value: string;
}>();
  readonly addHeaderChange = output();
  readonly removeHeaderChange = output<number>();
  readonly doneChange = output();

  isElectron = isElectronApp();
}

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
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
  @Input() headers: HeaderState = [];

  @Output() headerEnabledChange = new EventEmitter<{
    index: number;
    enabled: boolean;
  }>();
  @Output() headerKeyChange = new EventEmitter<{ index: number; key: string }>();
  @Output() headerValueChange = new EventEmitter<{
    index: number;
    value: string;
  }>();
  @Output() addHeaderChange = new EventEmitter();
  @Output() removeHeaderChange = new EventEmitter<number>();
  @Output() doneChange = new EventEmitter();

  isElectron = isElectronApp();
}

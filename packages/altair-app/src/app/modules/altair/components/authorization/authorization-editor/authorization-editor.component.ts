import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import {
  AUTHORIZATION_TYPES,
  AUTHORIZATION_TYPE_LIST,
  AuthorizationState,
  AuthorizationTypes,
  DEFAULT_AUTHORIZATION_TYPE,
} from 'altair-graphql-core/build/types/state/authorization.interface';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AUTHORIZATION_MAPPING } from '../authorizations';

@Component({
  selector: 'app-authorization-editor',
  templateUrl: './authorization-editor.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AuthorizationEditorComponent implements OnInit {
  typeForm = this.formBuilder.group<{
    type: AuthorizationTypes;
  }>({
    type: DEFAULT_AUTHORIZATION_TYPE,
  });

  @Input() authorizationState?: AuthorizationState;
  @Output() authTypeChange = this.typeForm.valueChanges.pipe(
    map(({ type }) => type ?? DEFAULT_AUTHORIZATION_TYPE),
    distinctUntilChanged()
  );
  @Output() authDataChange = new EventEmitter();
  AUTH_MAPPING = AUTHORIZATION_MAPPING;
  AUTH_TYPES = AUTHORIZATION_TYPE_LIST;

  constructor(private readonly formBuilder: NonNullableFormBuilder) {}

  ngOnInit(): void {
    if (this.authorizationState) {
      this.typeForm.patchValue({
        type: this.authorizationState.type,
      });
    }
  }
}

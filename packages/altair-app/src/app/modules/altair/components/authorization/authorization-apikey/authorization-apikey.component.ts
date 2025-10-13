import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  input,
  inject,
} from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import { ApiKeyAuthorizationProviderInput } from 'altair-graphql-core/build/authorization/providers/api-key';

@Component({
  selector: 'app-authorization-apikey',
  templateUrl: './authorization-apikey.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AuthorizationApikeyComponent implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  apiKeyForm = this.formBuilder.group<ApiKeyAuthorizationProviderInput['data']>({
    headerName: '',
    headerValue: '',
  });
  readonly authData = input<unknown>();
  readonly authDataChange = outputFromObservable(this.apiKeyForm.valueChanges);

  ngOnInit(): void {
    const authData = this.authData();
    if (authData) {
      this.apiKeyForm.patchValue(authData);
    }
  }
}

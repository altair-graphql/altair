import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Output,
  input
} from '@angular/core';
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
  apiKeyForm = this.formBuilder.group<ApiKeyAuthorizationProviderInput['data']>({
    headerName: '',
    headerValue: '',
  });
  readonly authData = input<unknown>();
  @Output() authDataChange = this.apiKeyForm.valueChanges;

  constructor(private readonly formBuilder: NonNullableFormBuilder) {}

  ngOnInit(): void {
    const authData = this.authData();
    if (authData) {
      this.apiKeyForm.patchValue(authData);
    }
  }
}

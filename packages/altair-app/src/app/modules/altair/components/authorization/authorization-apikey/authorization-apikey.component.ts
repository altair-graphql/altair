import { Component, Input, OnInit, Output } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-authorization-apikey',
  templateUrl: './authorization-apikey.component.html',
  styles: ``,
})
export class AuthorizationApikeyComponent implements OnInit {
  apiKeyForm = this.formBuilder.group({
    key: '',
    value: '',
  });
  @Input() authData?: unknown;
  @Output() authDataChange = this.apiKeyForm.valueChanges;

  constructor(private readonly formBuilder: NonNullableFormBuilder) {}

  ngOnInit(): void {
    if (this.authData) {
      this.apiKeyForm.patchValue(this.authData);
    }
  }
}

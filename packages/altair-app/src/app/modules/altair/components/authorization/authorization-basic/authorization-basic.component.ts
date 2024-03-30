import { Component, Input, OnInit, Output } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { SharedModule } from 'app/modules/altair/modules/shared/shared.module';

@Component({
  selector: 'app-authorization-basic',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './authorization-basic.component.html',
  styles: ``,
})
export class AuthorizationBasicComponent implements OnInit {
  basicForm = this.formBuilder.group({
    username: '',
    password: '',
  });
  @Input() authData?: unknown;
  @Output() authDataChange = this.basicForm.valueChanges;

  constructor(private readonly formBuilder: NonNullableFormBuilder) {}

  ngOnInit(): void {
    if (this.authData) {
      this.basicForm.patchValue(this.authData);
    }
  }
}

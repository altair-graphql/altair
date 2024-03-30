import { Component, Input, OnInit, Output } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { SharedModule } from 'app/modules/altair/modules/shared/shared.module';

@Component({
  selector: 'app-authorization-bearer',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './authorization-bearer.component.html',
  styles: ``,
})
export class AuthorizationBearerComponent implements OnInit {
  bearerForm = this.formBuilder.group({
    token: '',
  });
  @Input() authData?: unknown;
  @Output() authDataChange = this.bearerForm.valueChanges;

  constructor(private readonly formBuilder: NonNullableFormBuilder) {}

  ngOnInit(): void {
    if (this.authData) {
      this.bearerForm.patchValue(this.authData);
    }
  }
}

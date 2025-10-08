import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Output,
  input
} from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-authorization-bearer',
  templateUrl: './authorization-bearer.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AuthorizationBearerComponent implements OnInit {
  bearerForm = this.formBuilder.group({
    token: '',
  });
  readonly authData = input<unknown>();
  @Output() authDataChange = this.bearerForm.valueChanges;

  constructor(private readonly formBuilder: NonNullableFormBuilder) {}

  ngOnInit(): void {
    const authData = this.authData();
    if (authData) {
      this.bearerForm.patchValue(authData);
    }
  }
}

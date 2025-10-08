import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Output,
  input
} from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-authorization-basic',
  templateUrl: './authorization-basic.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AuthorizationBasicComponent implements OnInit {
  basicForm = this.formBuilder.group({
    username: '',
    password: '',
  });
  readonly authData = input<unknown>();
  @Output() authDataChange = this.basicForm.valueChanges;

  constructor(private readonly formBuilder: NonNullableFormBuilder) {}

  ngOnInit(): void {
    const authData = this.authData();
    if (authData) {
      this.basicForm.patchValue(authData);
    }
  }
}

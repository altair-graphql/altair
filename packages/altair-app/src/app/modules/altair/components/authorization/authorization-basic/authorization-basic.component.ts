import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  input,
  inject,
} from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-authorization-basic',
  templateUrl: './authorization-basic.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AuthorizationBasicComponent implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  basicForm = this.formBuilder.group({
    username: '',
    password: '',
  });
  readonly authData = input<unknown>();
  readonly authDataChange = outputFromObservable(this.basicForm.valueChanges);

  ngOnInit(): void {
    const authData = this.authData();
    if (authData) {
      this.basicForm.patchValue(authData);
    }
  }
}

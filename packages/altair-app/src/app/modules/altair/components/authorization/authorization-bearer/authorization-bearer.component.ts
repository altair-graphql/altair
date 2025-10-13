import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Output,
  input,
  inject,
} from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-authorization-bearer',
  templateUrl: './authorization-bearer.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AuthorizationBearerComponent implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  bearerForm = this.formBuilder.group({
    token: '',
  });
  readonly authData = input<unknown>();
  readonly authDataChange = outputFromObservable(this.bearerForm.valueChanges);

  ngOnInit(): void {
    const authData = this.authData();
    if (authData) {
      this.bearerForm.patchValue(authData);
    }
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  Output,
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
  @Input() authData?: unknown;
  @Output() authDataChange = this.bearerForm.valueChanges;

  constructor(private readonly formBuilder: NonNullableFormBuilder) {}

  ngOnInit(): void {
    if (this.authData) {
      this.bearerForm.patchValue(this.authData);
    }
  }
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LoadingRequestStateEntry } from 'altair-graphql-core/build/types/state/local.interfaces';

@Component({
  selector: 'app-request-loader',
  standalone: false,
  templateUrl: './request-loader.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestLoaderComponent {
  readonly requestState = input<LoadingRequestStateEntry[]>([]);
  readonly isLoading = input(false);
}

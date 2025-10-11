import {
  ChangeDetectionStrategy,
  Component,
  input,
  inject,
  computed,
} from '@angular/core';
import { IDictionary } from '../../interfaces/shared';
import {
  EnvironmentService,
  VARIABLE_REGEX,
} from '../../services/environment/environment.service';
import { HighlightSection } from '../fancy-input/fancy-input.component';

@Component({
  selector: 'app-fancy-input-marker',
  templateUrl: './fancy-input-marker.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false,
  standalone: false,
})
export class FancyInputMarkerComponent {
  private environmentService = inject(EnvironmentService);

  readonly section = input<HighlightSection>({ content: '' });

  readonly resolvedValue = computed(() =>
    this.environmentService.hydrate(this.section().content)
  );
}

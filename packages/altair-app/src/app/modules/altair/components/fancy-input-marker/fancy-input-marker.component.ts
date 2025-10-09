import { ChangeDetectionStrategy, Component, OnChanges, SimpleChanges, input, inject } from '@angular/core';
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
export class FancyInputMarkerComponent implements OnChanges {
  private environmentService = inject(EnvironmentService);

  readonly section = input<HighlightSection>({ content: '' });
  readonly activeEnvironment = input<IDictionary>({});

  resolvedValue = '';

  ngOnChanges(changes: SimpleChanges) {
    this.resolvedValue = this.environmentService.hydrate(this.section().content);
  }
}

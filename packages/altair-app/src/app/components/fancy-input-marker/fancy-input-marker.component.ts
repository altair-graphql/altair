import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IDictionary } from 'app/interfaces/shared';
import { EnvironmentService, VARIABLE_REGEX } from 'app/services/environment/environment.service';
import { HighlightSection } from '../fancy-input/fancy-input.component';

@Component({
  selector: 'app-fancy-input-marker',
  templateUrl: './fancy-input-marker.component.html',
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false,
})
export class FancyInputMarkerComponent implements OnInit, OnChanges {

  @Input() section: HighlightSection = { content: '' };
  @Input() activeEnvironment: IDictionary = {};

  resolvedValue = '';

  constructor(
    private environmentService: EnvironmentService,
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.resolvedValue = this.environmentService.hydrate(this.section.content);
  }

}

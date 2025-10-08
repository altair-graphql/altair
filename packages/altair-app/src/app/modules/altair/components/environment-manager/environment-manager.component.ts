import {
  Component,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  input,
  linkedSignal,
  computed,
} from '@angular/core';

import {
  BaseEnvironmentState,
  EnvironmentsState,
  EnvironmentState,
} from 'altair-graphql-core/build/types/state/environments.interfaces';
import { Extension } from '@codemirror/state';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { NotifyService } from '../../services';

@Component({
  selector: 'app-environment-manager',
  templateUrl: './environment-manager.component.html',
  styleUrls: ['./environment-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class EnvironmentManagerComponent {
  readonly environments = input.required<EnvironmentsState>();
  readonly showEnvironmentManager = input(false);
  @Output() toggleDialogChange = new EventEmitter();
  @Output() baseEnvironmentJsonChange = new EventEmitter();
  @Output() subEnvironmentJsonChange = new EventEmitter();
  @Output() subEnvironmentTitleChange = new EventEmitter();
  @Output() addSubEnvironmentChange = new EventEmitter();
  @Output() deleteSubEnvironmentChange = new EventEmitter();
  @Output() repositionSubEnvironmentsChange = new EventEmitter();
  @Output() importEnvironmentChange = new EventEmitter();
  @Output() exportEnvironmentChange = new EventEmitter<EnvironmentState>();

  @ViewChild('subEnvironmentTitle') subEnvironmentTitleEl?: ElementRef;

  editorExtensions: Extension[] = [json(), linter(jsonParseLinter())];

  selectedEnvironmentId = linkedSignal(() => {
    const environments = this.environments();
    if (environments?.activeSubEnvironment) {
      return environments.activeSubEnvironment;
    }
    return 'base';
  });
  selectedEnvironment = computed<
    BaseEnvironmentState | EnvironmentState | undefined
  >(() => {
    const selectedId = this.selectedEnvironmentId();
    const environments = this.environments();
    if (selectedId === 'base') {
      return environments.base;
    }
    return environments.subEnvironments.find((env) => env.id === selectedId);
  });
  editorContent = linkedSignal(() => {
    return this.selectedEnvironment()?.variablesJson || '{}';
  });
  editorTitle = linkedSignal(() => {
    const selectedEnvironment = this.selectedEnvironment();
    if (selectedEnvironment && 'title' in selectedEnvironment) {
      return selectedEnvironment.title || '';
    }
    return '';
  });

  constructor(private notifyService: NotifyService) {}

  onSortSubEnvironments(event: CdkDragDrop<any, any, any>) {
    this.repositionSubEnvironmentsChange.emit({
      currentPosition: event.previousIndex || 0,
      newPosition: event.currentIndex || 0,
    });
  }

  onEditorChange(content: string) {
    try {
      const parsed = JSON.parse(content);
      const invalidKey = Object.keys(parsed).find(
        (key) => !key.match(/^[a-zA-Z0-9_]+$/)
      );
      if (invalidKey) {
        this.notifyService.warning(
          `"${invalidKey}" is an invalid environment variable. Only alphanumeric characters and underscores are allowed.`
        );
        throw new Error('Invalid key');
      }

      if (this.selectedEnvironmentId() === 'base') {
        this.baseEnvironmentJsonChange.next({ value: content });
      } else {
        this.subEnvironmentJsonChange.next({
          id: this.selectedEnvironmentId,
          value: content,
        });
      }
    } catch (ex) {
      // Do nothing.
    }
  }

  onTitleChange(content: string) {
    this.subEnvironmentTitleChange.next({
      id: this.selectedEnvironmentId,
      value: content,
    });
  }

  getExportedEnvironment(
    environment?: BaseEnvironmentState | EnvironmentState
  ): EnvironmentState | undefined {
    if (!environment) {
      return;
    }
    return {
      title: 'Environment',
      ...environment,
    };
  }

  setFocusOnEnvironmentTitle() {
    if (this.subEnvironmentTitleEl) {
      this.subEnvironmentTitleEl.nativeElement.focus();
    }
  }

  onDeleteSubEnvironment() {
    if (confirm('Are you sure you want to delete this environment?')) {
      this.deleteSubEnvironmentChange.next({ id: this.selectedEnvironmentId });
      // After deletion, set the active environment to base
      this.selectedEnvironmentId.set('base');
    }
  }

  trackById<T extends { id?: string }>(index: number, item: T) {
    return item.id;
  }
}

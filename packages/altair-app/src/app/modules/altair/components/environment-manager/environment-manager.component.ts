import {
  Component,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  input,
  linkedSignal,
  computed,
  inject,
  effect,
  signal,
  output,
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
  private notifyService = inject(NotifyService);

  readonly environments = input.required<EnvironmentsState>();
  readonly showEnvironmentManager = input(false);
  readonly toggleDialogChange = output<boolean>();
  readonly baseEnvironmentJsonChange = output<{
    value: string;
  }>();
  readonly subEnvironmentJsonChange = output<{
    id: string;
    value: string;
  }>();
  readonly subEnvironmentTitleChange = output<{
    id: string;
    value: string;
  }>();
  readonly addSubEnvironmentChange = output<void>();
  readonly deleteSubEnvironmentChange = output<{
    id: string;
  }>();
  readonly repositionSubEnvironmentsChange = output<{
    currentPosition: number;
    newPosition: number;
  }>();
  readonly importEnvironmentChange = output<void>();
  readonly exportEnvironmentChange = output<EnvironmentState>();

  @ViewChild('subEnvironmentTitle') subEnvironmentTitleEl?: ElementRef;

  editorExtensions: Extension[] = [json(), linter(jsonParseLinter())];

  readonly activeEnvironmentId = computed(() => {
    return this.environments().activeSubEnvironment || 'base';
  });
  readonly selectedEnvironmentId = linkedSignal(() => {
    return this.activeEnvironmentId();
  });
  readonly selectedEnvironment = computed<
    BaseEnvironmentState | EnvironmentState | undefined
  >(() => {
    const selectedId = this.selectedEnvironmentId();
    const environments = this.environments();
    if (selectedId === 'base') {
      return environments.base;
    }
    return environments.subEnvironments.find((env) => env.id === selectedId);
  });
  readonly editorContent = linkedSignal(() => {
    return this.selectedEnvironment()?.variablesJson || '{}';
  });
  readonly editorTitle = linkedSignal(() => {
    const selectedEnvironment = this.selectedEnvironment();
    if (selectedEnvironment && 'title' in selectedEnvironment) {
      return selectedEnvironment.title || '';
    }
    return '';
  });

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
        this.baseEnvironmentJsonChange.emit({ value: content });
      } else {
        this.subEnvironmentJsonChange.emit({
          id: this.selectedEnvironmentId(),
          value: content,
        });
      }
    } catch (ex) {
      // Do nothing.
    }
  }
  onSelectEnvironment(id?: string) {
    if (!id) {
      return;
    }
    this.selectedEnvironmentId.set(id);
  }

  onTitleChange(content: string) {
    this.subEnvironmentTitleChange.emit({
      id: this.selectedEnvironmentId(),
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
      this.deleteSubEnvironmentChange.emit({ id: this.selectedEnvironmentId() });
      // After deletion, set the active environment to base
      this.selectedEnvironmentId.set('base');
    }
  }

  onExportEnvironment() {
    const env = this.getExportedEnvironment(this.selectedEnvironment());
    if (env) {
      this.exportEnvironmentChange.emit(env);
    }
  }

  trackById<T extends { id?: string }>(index: number, item: T) {
    return item.id;
  }
}

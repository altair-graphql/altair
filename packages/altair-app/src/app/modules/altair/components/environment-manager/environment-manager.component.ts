import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  input
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
export class EnvironmentManagerComponent implements OnInit, OnChanges {
  @Input() environments?: EnvironmentsState;
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

  selectedEnvironmentId = 'base';
  selectedEnvironment?: EnvironmentState | BaseEnvironmentState;
  editorContent = '{}';
  editorTitle = '';

  constructor(private notifyService: NotifyService) {}

  ngOnInit() {
    if (this.environments) {
      this.selectEnvironment(this.environments.activeSubEnvironment);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.environments?.currentValue) {
      this.selectEnvironment(this.selectedEnvironmentId);
    }
  }

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

      if (this.selectedEnvironmentId === 'base') {
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

  selectEnvironment(id?: string) {
    if (!this.environments) {
      throw new Error('should never happen');
    }
    this.selectedEnvironmentId = id || 'base';

    if (this.selectedEnvironmentId === 'base') {
      this.selectedEnvironment = this.environments.base;
    } else {
      this.selectedEnvironment = this.environments.subEnvironments.find(
        (env) => env.id === this.selectedEnvironmentId
      );
    }

    if (this.selectedEnvironment) {
      this.editorContent = this.selectedEnvironment.variablesJson;
      if ('title' in this.selectedEnvironment) {
        this.editorTitle = this.selectedEnvironment.title;
      }
    }
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
      this.selectEnvironment();
    }
  }

  trackById<T extends { id?: string }>(index: number, item: T) {
    return item.id;
  }
}

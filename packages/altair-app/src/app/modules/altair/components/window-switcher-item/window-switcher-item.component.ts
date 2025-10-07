import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map } from 'rxjs';
import { getWindowCollection } from '../../store/collection/utils';
import { windowHasUnsavedChanges } from '../../store';

const ICON_STATE = {
  DEFAULT: 'default',
  IN_COLLECTION: 'in-collection',
  IS_LOADING: 'is-loading',
  IS_EDITING: 'is-editing',
} as const;

@Component({
  selector: 'app-window-switcher-item',
  templateUrl: './window-switcher-item.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class WindowSwitcherItemComponent {
  @Input() set window(value: PerWindowState | undefined) {
    this.windowSubject.next(value);
  }
  @Input() activeWindowId = '';
  @Input() set isEditing(value: boolean) {
    this.isEditingSubject.next(value);
  }
  @Input() isClosable = true;
  @Input() set collections(value: IQueryCollection[]) {
    this.collectionsSubject.next(value);
  }
  @Output() clickWindowChange = new EventEmitter<string>();
  @Output() editWindowNameInput = new EventEmitter<string>();
  @Output() saveWindowNameChange = new EventEmitter<string>();
  @Output() closeWindowChange = new EventEmitter<unknown>();

  @ViewChild('wTitle') private wTitle!: ElementRef<HTMLElement>;

  windowSubject = new BehaviorSubject<PerWindowState | undefined>(undefined);
  collectionsSubject = new BehaviorSubject<IQueryCollection[]>([]);
  isEditingSubject = new BehaviorSubject<boolean>(false);

  isEditing$ = this.isEditingSubject.asObservable().pipe(distinctUntilChanged());
  window$ = this.windowSubject.asObservable().pipe(distinctUntilChanged());
  collections$ = this.collectionsSubject.asObservable().pipe(distinctUntilChanged());
  isWindowInCollection$ = combineLatest([this.window$, this.collections$]).pipe(
    map(([w, collections]) => {
      return !!w && !!getWindowCollection(w, collections);
    })
  );
  isWindowUnsaved$ = combineLatest([this.window$, this.collections$]).pipe(
    map(([w, collections]) => !!w && windowHasUnsavedChanges(w, collections))
  );
  iconState$ = combineLatest([
    this.window$,
    this.isWindowInCollection$,
    this.isEditing$,
  ]).pipe(
    map(([w, isInCollection, isEditing]) => {
      if (!w) return ICON_STATE.DEFAULT;
      if (isEditing) return ICON_STATE.IS_EDITING;
      if (isInCollection) return ICON_STATE.IN_COLLECTION;
      if (w.layout.isLoading) return ICON_STATE.IS_LOADING;
      return ICON_STATE.DEFAULT;
    })
  );

  onClickWindow() {
    const window = this.windowSubject.getValue();
    if (window) {
      this.clickWindowChange.emit(window.windowId);
    }
  }

  onDoubleClick() {
    const window = this.windowSubject.getValue();
    if (window) {
      this.editWindowNameInput.emit(window.windowId);
      setTimeout(() => this.wTitle.nativeElement.focus(), 0);
    }
  }
}

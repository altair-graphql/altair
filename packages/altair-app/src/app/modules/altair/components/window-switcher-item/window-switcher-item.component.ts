import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  input,
  output,
} from '@angular/core';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { PerWindowState } from 'altair-graphql-core/build/types/state/per-window.interfaces';
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
  readonly window = input<PerWindowState>();
  readonly activeWindowId = input('');
  readonly isEditing = input(false);
  readonly isClosable = input(true);
  readonly collections = input<IQueryCollection[]>([]);
  readonly clickWindowChange = output<string>();
  readonly editWindowNameInput = output<string>();
  readonly saveWindowNameChange = output<string>();
  readonly closeWindowChange = output();

  @ViewChild('wTitle') private wTitle!: ElementRef<HTMLElement>;

  readonly isWindowInCollection = computed(() => {
    const w = this.window();
    const collections = this.collections();
    return !!w && !!getWindowCollection(w, collections);
  });
  readonly isWindowUnsaved = computed(() => {
    const w = this.window();
    const collections = this.collections();
    return !!w && windowHasUnsavedChanges(w, collections);
  });
  readonly iconState = computed(() => {
    const w = this.window();
    const isInCollection = this.isWindowInCollection();
    const isEditing = this.isEditing();
    if (!w) return ICON_STATE.DEFAULT;
    if (isEditing) return ICON_STATE.IS_EDITING;
    if (isInCollection) return ICON_STATE.IN_COLLECTION;
    if (w.layout.isLoading) return ICON_STATE.IS_LOADING;
    return ICON_STATE.DEFAULT;
  });

  onClickWindow() {
    const window = this.window();
    if (window) {
      this.clickWindowChange.emit(window.windowId);
    }
  }

  onDoubleClick() {
    const window = this.window();
    if (window) {
      this.editWindowNameInput.emit(window.windowId);
      setTimeout(() => this.wTitle.nativeElement.focus(), 0);
    }
  }
}

import { InteropAppState } from '@altairgraphql/electron-interop';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';

export class InteropStateManager {
  /** BehaviorSubject that holds the current state */
  private readonly stateSubject = new BehaviorSubject<InteropAppState>({
    windows: {},
  });

  constructor(initialState?: InteropAppState) {
    if (initialState) {
      this.stateSubject.next(initialState);
    }
  }

  getState(): InteropAppState {
    return this.stateSubject.getValue();
  }

  setState(state: InteropAppState) {
    this.stateSubject.next(state);
  }

  getWindowState(windowId: string): InteropAppState['windows'][string] | undefined {
    return this.stateSubject.getValue().windows[windowId];
  }

  setWindowState(windowId: string, windowState: InteropAppState['windows'][string]) {
    const currentState = this.stateSubject.getValue();
    this.stateSubject.next({
      ...currentState,
      windows: {
        ...currentState.windows,
        [windowId]: windowState,
      },
    });
  }

  asObservable(): Observable<InteropAppState> {
    return this.stateSubject.asObservable();
  }

  asActiveWindowStateObservable(): Observable<InteropAppState['windows'][string]> {
    return this.asObservable().pipe(
      map((state) =>
        state.activeWindowId
          ? state.windows[state.activeWindowId] ?? this.defaultWindowState()
          : this.defaultWindowState()
      ),
      distinctUntilChanged()
    );
  }

  asWindowStateObservable(
    windowId: string
  ): Observable<InteropAppState['windows'][string]> {
    return this.asObservable().pipe(
      map((state) => state.windows[windowId] ?? this.defaultWindowState()),
      distinctUntilChanged()
    );
  }

  private defaultWindowState(): InteropAppState['windows'][string] {
    return {
      windowId: '',
      headers: [],
      showDocs: false,
    };
  }
}

import { EMPTY, Observable } from 'rxjs';

import { switchMap } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, ofType, createEffect } from '@ngrx/effects';

import { ElectronAppService } from '../services';

import * as windowsMetaActions from '../store/windows-meta/windows-meta.action';

import { openFile } from '../utils';

@Injectable()
export class WindowsMetaEffects {
  private actions$ = inject(Actions);
  private electronAppService = inject(ElectronAppService);

  exportBackupData$: Observable<Action> = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(windowsMetaActions.EXPORT_BACKUP_DATA),
        switchMap(() => {
          this.electronAppService.exportBackupData();
          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );

  importBackupData$: Observable<Action> = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(windowsMetaActions.IMPORT_BACKUP_DATA),
        switchMap(() => {
          openFile({ accept: '.agbkp' }).then((fileContent: string) => {
            this.electronAppService.importBackupData(fileContent);
          });
          return EMPTY;
        })
      );
    },
    { dispatch: false }
  );
}

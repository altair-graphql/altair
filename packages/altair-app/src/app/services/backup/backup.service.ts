import { Injectable } from '@angular/core';
import { getAppStateFromStorage, importIndexedRecords } from 'app/store/async-storage-sync';
import { openFile, downloadData } from 'app/utils';
import { ObjectLocalStorage } from 'app/utils/object-local-storage';
import { NotifyService } from '../notify/notify.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class BackupService {

  constructor(
    private notifyService: NotifyService,
  ) { }


/**
 * Backup file structure
 * -----------
 * {
 *  version: 1,
 *  localstore: <localstorage data>
 * }
 * {
 *  version: 2,
 *  indexedrecords: <indexed key-value pair list>
 * }
 */

async importBackupData() {
  // open file
  // get JSON
  // check version 1 of file
  console.log('TEST: opening file..')
  const fileContent = await openFile({ accept: '.agbkp' });
  console.log('TEST: opened.')
  if (!fileContent) {
    // notify invalid file
    return this.notifyService.error('Invalid file');
  }
  const fileObj = JSON.parse(fileContent);
  if (fileObj.version === 1 && fileObj.localstore) {
    const localStorage = new ObjectLocalStorage(fileObj.localstore);
    // set the data to store
    await getAppStateFromStorage({
      updateFromLocalStorage: true,
      forceUpdateFromProvidedData: true,
      storage: localStorage,
    });
    // reload the app
    return location.reload();
  }

  if (fileObj.version === 2 && fileObj.indexedrecords) {
    // Set indexedDb data
    await importIndexedRecords(fileObj.indexedrecords);
    // reload the app
    return location.reload();
  }

  // notify invlaid file content
  return this.notifyService.error('Invalid file content.');
};

async exportBackupData () {
  // get store data, in indexedrecords format
  // create data following schema
  // save stringified to file with agbkp extension
  const asyncStorage = new StorageService();
  const stateList = await asyncStorage.appState.toArray();
  const backupData = {
    version: 2,
    indexedrecords: stateList,
  };
  downloadData(JSON.stringify(backupData), 'altair_backup', { fileType: 'agbkp' });
};
}

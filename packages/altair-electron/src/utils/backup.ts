import { app, BrowserWindow, dialog } from 'electron';
import ElectronStore from 'electron-store';
import fs from 'fs';

export const setAutobackup = (data: string) => {
  const backupStore = new ElectronStore({ name: 'autobackup' });
  backupStore.set('autobackup', data);
};

export const getAutobackup = () => {
  const backupStore = new ElectronStore({ name: 'autobackup' });
  return backupStore.get('autobackup');
};

export const importBackupData = (instance: BrowserWindow) => {
  // const store = new PersistentStore();
  dialog
    .showOpenDialog(instance, {
      title: 'Import application data',
      message: 'Only import a valid Altair backup file',
      properties: ['openFile'],
      filters: [{ name: 'Altair GraphQL Backup Files', extensions: ['agbkp'] }],
    })
    .then(({ canceled, filePaths: [filePath] }) => {
      if (canceled) {
        return;
      }

      if (filePath) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        try {
          instance.webContents.send('import-app-data', fileContent);
        } catch (error) {
          dialog.showErrorBox(
            'Invalid file',
            'The selected file is either invalid or corrupted. Please check the file and try again.'
          );
        }
      }
    });
};

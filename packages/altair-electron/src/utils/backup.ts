// TODO: To be deleted!
import { app, BrowserWindow, dialog } from "electron";
import fs from "fs";
import { PersistentStore } from "../store";

/**
 * Backup file structure
 * -----------
 * {
 *  version: 1,
 *  localstore: <localstorage data>
 * }
 */

export const importBackupData = (instance: BrowserWindow) => {
  // const store = new PersistentStore();
  dialog
    .showOpenDialog(instance, {
      title: "Import application data",
      message: "Only import a valid Altair backup file",
      properties: ["openFile"],
      filters: [{ name: "Altair GraphQL Backup Files", extensions: ["agbkp"] }]
    })
    .then(({ canceled, filePaths: [filePath] }) => {
      if (canceled) {
        return;
      }

      if (filePath) {
        const fileContent = fs.readFileSync(filePath, "utf8");
        try {
          instance.webContents.send("import-app-data", fileContent);
          // const fileObj = JSON.parse(fileContent);
          // Check for the presence of some basic altair data to try to validate the file
          // if (fileObj.version === 1 && fileObj.localstore && fileObj.localstore.altair__debug_current_version) {
          //   fs.writeFileSync(store.path, JSON.stringify(fileObj.localstore));
          //   app.relaunch();
          //   app.exit(0);
          // } else {
          //   throw new Error('Invalid file content.');
          // }
        } catch (error) {
          dialog.showErrorBox(
            "Invalid file",
            "The selected file is either invalid or corrupted. Please check the file and try again."
          );
        }
      }
    });
};

export const exportBackupData = (instance: BrowserWindow) => {
  const store = new PersistentStore();
  dialog
    .showSaveDialog(instance, {
      title: "Backup application data",
      defaultPath: "altair_backup.agbkp",
      filters: [{ name: "Altair GraphQL Backup Files", extensions: ["agbkp"] }]
    })
    .then(({ canceled, filePath }) => {
      if (canceled) {
        return;
      }

      if (filePath) {
        // Save to file
        const localstoreContent = fs.readFileSync(store.path, "utf8");
        const backupData = {
          version: 1,
          localstore: JSON.parse(localstoreContent)
        };
        fs.writeFileSync(filePath, JSON.stringify(backupData));
      }
    });
};

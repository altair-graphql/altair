const { app, dialog } = require('electron');
const { resolve } = require('path');
const { renameSync } = require('fs');
const { getDirectoriesInDirectory, deleteFolderRecursive } = require('./index');

const userDataParentPath = resolve(app.getPath('userData'), '..');

const DIR_2_3_7 = 'altair';
const DIR_2_3_6 = 'altair-electron';
const DIR_ALL = 'Altair GraphQL Client';
const userDataVersions = [
  DIR_2_3_6, // v2.3.6
  DIR_2_3_7, // v2.3.7
  DIR_ALL, // all others
];

const checkMultipleDataVersions = (win) => {
  getDirectoriesInDirectory(userDataParentPath).then((directories) => {
    const foundVersions = directories.filter(dir => userDataVersions.includes(dir));

    if (foundVersions.length > 1) {
      console.log(foundVersions);
      dialog.showMessageBox(win, {
        type: 'info',
        buttons: [ 'This is the correct version', 'Clear this version', 'Remind me later' ],
        defaultId: 0,
        cancelId: 2,
        title: 'Multiple versions found',
        message: 'We found multiple versions of your Altair data',
        detail: `Due to some misconfiguration that happened in some of the recent versions of Altair, there are several versions of your data. We want to help you keep the right data.\n\nTo do that, check if the current data is correct, and we will clear out the rest.\n\nTip: You can click the 'Remind me later' and we'll ask again when you restart.`
      }, (response) => {
        switch (response) {
          case 0: // Correct version
            // Clear other data
            foundVersions
              .filter(v => v !== DIR_ALL)
              .forEach(version => {
                console.log('removing version', version);
                // Delete DIR_2_3_6 and DIR_2_3_7
                deleteFolderRecursive(resolve(userDataParentPath, version));
              });
            app.relaunch();
            app.exit(0);
            return;
          case 1: // clear THIS version
            // Clear THIS data
            const nextVersion = foundVersions.find(v => v !== DIR_ALL);
            if (nextVersion) {
              console.log('next version', nextVersion);
              // Delete DIR_ALL
              deleteFolderRecursive(resolve(userDataParentPath, DIR_ALL));
              // Move the next version (DIR_2_3_6 or DIR_2_3_7) to DIR_ALL
              renameSync(resolve(userDataParentPath, nextVersion), resolve(userDataParentPath, DIR_ALL));
              app.relaunch();
              app.exit(0);
            }
            return;
          default: // do nothing
            console.log('Doing nothing.');
        }
      });
    }
  });
};

module.exports = {
  checkMultipleDataVersions,
};

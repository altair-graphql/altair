// Saves options to chrome.storage
export function save_options() {
  const showChangeLog = (
    document.getElementById('show_changelog') as HTMLInputElement
  )?.checked;
  chrome.storage.sync.set(
    {
      showChangeLog: showChangeLog,
    },
    function () {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      if (status) {
        status.textContent = 'Options saved.';
        setTimeout(function () {
          status.textContent = '';
        }, 750);
      }
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value showChangeLog = true.
  chrome.storage.sync.get(
    {
      showChangeLog: true,
    },
    function (items) {
      const showChangeLogCheckbox = document.getElementById(
        'show_changelog'
      ) as HTMLInputElement;
      if (showChangeLogCheckbox) {
        showChangeLogCheckbox.checked = items.showChangeLog;
      }
    }
  );
}

document.addEventListener('DOMContentLoaded', restore_options);
const saveButton = document.getElementById('save');
if (saveButton) {
  saveButton.addEventListener('click', save_options);
}

// Saves options to chrome.storage
function save_options() {
  var showChangeLog = document.getElementById('show_changelog').checked;
  chrome.storage.sync.set({
    showChangeLog: showChangeLog
  }, function () {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function () {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value showChangeLog = true.
  chrome.storage.sync.get({
    showChangeLog: true
  }, function (items) {
    document.getElementById('show_changelog').checked = items.showChangeLog;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
  save_options);
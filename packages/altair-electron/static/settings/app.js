const ipc = require('electron').ipcRenderer;
const { SETTINGS_STORE_EVENTS } = require('../../dist/settings/constants');

/**
 * event delegation
 * @param {string} selector
 * @param {string} eventName
 * @param {(e: Event) => void} handler
 */
const on = (selector, eventName, handler) => {
  document.addEventListener(eventName, function(e) {
    // loop parent nodes from the target to the delegation node
    for (let target = e.target; target && target !== this; target = target.parentNode) {
      if (target.matches(selector)) {
        Reflect.apply(handler, target, [ e ]);
        break;
      }
    }
  }, false);
};

const serializeForm = (form) => {
	let obj = {};
  const data = new FormData(form);
	for (let [key, value] of data) {
		if (typeof obj[key] === 'undefined') {
      obj[key] = value;
    } else {
			if (!Array.isArray(obj[key])) {
				obj[key] = [obj[key]];
			}
			obj[key].push(value);
		}
	}
	return obj;
};

const hideAllNested = () => {
  document.querySelectorAll('.nested').forEach(el => {
    el.classList.add('hidden');
  });
  document.querySelectorAll('input.js-input[type="radio"]:checked').forEach((radioEl) => {
    const radioContainer = radioEl.closest('.radio');
    const nested = radioContainer.querySelector('.nested');
    if (nested) {
      nested.classList.remove('hidden');
    }
  });
};

// Initialize when loaded
document.addEventListener('DOMContentLoaded', function () {
  // load settings
  const initialData = ipc.sendSync(SETTINGS_STORE_EVENTS.GET_SETTINGS_DATA) || {};
  // set selected settings
  const networkForm = document.querySelector('.js-network-form');
  Object.keys(initialData).forEach((key) => {
    networkForm[key].value = initialData[key];
  });
  // hide nested
  hideAllNested();

  on('input.js-input[type="radio"]', 'click', () => {
    hideAllNested();
  });

  on('.js-network-form', 'submit', (e) => {
    e.preventDefault();
    const formData = serializeForm(e.target);

    console.log('submitted.', formData);
    ipc.sendSync(SETTINGS_STORE_EVENTS.UPDATE_SETTINGS_DATA, formData);
    ipc.sendSync('restart-app');
  });
});

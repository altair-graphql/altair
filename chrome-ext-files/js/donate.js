(function() {
  const donateButton = document.querySelector('.donate-button');
  const resultSection = document.querySelector('.result-section');

  donateButton.addEventListener('click', (e) => {
    google.payments.inapp.buy({
      parameters: {'env': 'prod'},
      'sku': 'donate_10_dollars',
      'success': onPurchase,
      'failure': onPurchaseFailed
    });
  });

  function onPurchase(purchase) {
    console.log('onPurchase', purchase);
    const orderId = purchase.response.orderId;
    resultSection.innerHTML = 'Donation completed. Order ID: ' + orderId;
    chrome.storage.sync.set({
      userDonated: true
    });
  }

  function onPurchaseFailed(purchase) {
    console.log('onPurchaseFailed', purchase);
    var reason = purchase.response.errorType;
    resultSection.innerHTML = 'Donation failed. ' + reason;
  }
})();
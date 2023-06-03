chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { order } = request;
  console.log(order);
  switch (order) {
    case 'start':
      chrome.storage.local.get().then(({ abbrIndex, jsonData }) => {
        if (!abbrIndex || !jsonData) return sendResponse({ type: 'error', msg: 'No data loaded' });
        getCurrentTab().then((currentTab) => {
          if (!currentTab.url) return sendResponse({ type: 'error', msg: 'Please go to the correct url' });
          if (currentTab.url?.includes('paper-trader.com/management/pta-products')) {
            sendResponse({ type: 'success', msg: 'Starting' });
            start(currentTab.id);
          } else {
            sendResponse({ type: 'Error', msg: 'Please go to the correct url' });
          }
        });
      });
      break;
  }
  return true;
});

async function start(TargetTabId) {
  chrome.scripting.executeScript({
    target: { tabId: TargetTabId },
    files: ['inject.js'],
  });
  // chrome.tabs.onUpdated.addListener((tabId, info) => {
  //   if (tabId == TargetTabId && info.status == 'complete')
  //     chrome.scripting.executeScript({
  //       target: { tabId: TargetTabId },
  //       files: ['inject.js'],
  //     });
  // });
}

async function getCurrentTab() {
  let [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tab;
}

(async () => {
  const { jsonData } = await chrome.storage.local.get();
  console.log(jsonData);
})();

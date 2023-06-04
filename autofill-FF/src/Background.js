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
    case 'selectAll':
      getCurrentTab().then((currentTab) => {
        runScript(currentTab.id, 'selectAll.js');
      });
      break;
  }
  return true;
});

async function start(targetTabId) {
  chrome.scripting.executeScript({
    target: { tabId: targetTabId },
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

function runScript(targetTabId, fileName) {
  chrome.scripting.executeScript({
    target: { tabId: targetTabId },
    files: [fileName],
  });
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

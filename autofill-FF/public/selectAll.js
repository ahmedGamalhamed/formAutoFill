(async () => {
  console.log('SelectAll');
  const url = location.href;
  if (url.includes('rmd.paper-trader.com/management/tradeables') || url.includes('management/bad-users/brokers')) {
    const card = document.querySelector('.ant-table-body');
    const { select } = await chrome.storage.local.get();
    const checkBoxes = Array.from(card.querySelectorAll('[type="checkbox"]'));
    checkBoxes.forEach((checkbox) => {
      if (checkbox.checked !== select) checkbox.click();
    });
  }
})();

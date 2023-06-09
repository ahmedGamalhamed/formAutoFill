(async () => {
  console.log('SelectAll');
  const card = document.querySelector('.ant-table-body');
  const { select } = await chrome.storage.local.get();
  const checkBoxes = Array.from(card.querySelectorAll('[type="checkbox"]'));
  checkBoxes.forEach((checkbox) => {
    if (checkbox.checked !== select) checkbox.click();
  });
})();

import readXlsxFile from 'read-excel-file';
import transpose from 'transpose-2d-array';
const fileInput = document.getElementById('fileInput');
const startForm = document.querySelector('#startForm');
const successAlert = document.querySelector('#sucess-alert');
const dangerAlert = document.querySelector('#danger-alert');
const spinner = document.querySelector('#spinner');
const startBtn = document.querySelector('#startBtn');
const endAbbrInput = document.querySelector('#endAbbr');
const startAbbrInput = document.querySelector('#startAbbr');
const fileForm = document.querySelector('#fileForm');
const sheetNameInput = document.querySelector('#sheetNameInput');
const selectAllBtn = document.querySelector('#selectAllBtn');
const deselectAllBtn = document.querySelector('#deselectAllBtn');
fileForm.onsubmit = (e) => {
  e.preventDefault();
  readXlsxFile(fileInput.files[0], { sheet: sheetNameInput.value })
    .then((rows) => {
      chrome.runtime.sendMessage({ order: 'newData', rows });
      let jsonData = [];
      let abbrIndex = [];
      rows.splice(0, 1);
      const transposedData = transpose(rows);
      console.log({ transposedData });
      const titleArr = transposedData[0];
      transposedData.slice(1, -1).forEach((row) => {
        let entryObj = {};
        row.forEach((entry, index) => {
          const key = titleArr[index];
          entryObj[key] = entry;
        });
        jsonData.push(entryObj);
        abbrIndex.push(entryObj['Product Abbreviation']);
      });
      console.log({ abbrIndex });
      console.log(jsonData);
      chrome.storage.local.set({ jsonData, abbrIndex }).then((res) => showAlert('success', 'Saved'));
    })
    .catch((err) => {
      showAlert('error', err.message);
    });
};

startForm.onsubmit = async (e) => {
  e.preventDefault();
  hideAlert();
  const { jsonData, abbrIndex } = await chrome.storage.local.get();
  if (!jsonData || !abbrIndex) return showAlert('error', 'No data in storage,please reupload the file');
  const startAbbr = startAbbrInput.value;
  const endAbbr = endAbbrInput.value;
  const startIndex = abbrIndex.indexOf(startAbbr);
  const endIndex = abbrIndex.indexOf(endAbbr);
  if (startIndex == -1) return showAlert('error', 'Wrong start Abbr');
  if (endIndex == -1) return showAlert('error', 'Wrong end Abbr');
  await chrome.storage.local.set({ manualStart: true, startIndex, endIndex });
  chrome.runtime.sendMessage({ order: 'start' }).then((result) => {
    const { type, msg } = result;
    showAlert(type, msg);
  });
};

function showAlert(type, text) {
  spinner.style.display = 'none';
  if (text == 'TypeError: Failed to fetch') text = `Couldn't connect to server`;
  if (type == 'success') {
    dangerAlert.style.display = 'none';
    successAlert.style.display = '';
    successAlert.textContent = text;
  } else {
    successAlert.style.display = 'none';
    dangerAlert.style.display = '';
    dangerAlert.textContent = text;
  }
}
function hideAlert() {
  dangerAlert.style.display = 'none';
  successAlert.style.display = 'none';
}
selectAllBtn.onclick = async () => {
  await chrome.storage.local.set({ select: true });
  chrome.runtime.sendMessage({ order: 'selectAll' });
};
deselectAllBtn.onclick = async () => {
  await chrome.storage.local.set({ select: false });
  chrome.runtime.sendMessage({ order: 'selectAll' });
};

{
  (async function start() {
    try {
      let { abbrIndex, jsonData, manualStart, startIndex, endIndex } = await chrome.storage.local.get();
      let entry = jsonData[startIndex];
      console.log(`Start: ${startIndex}, End: ${endIndex}, Current Title: ${entry.Title}`);
      console.log(entry);
      let addProductBtn = document.querySelector('.Button');
      if (addProductBtn) addProductBtn.click();

      // 1st step
      await handleFirstStep(entry);

      // 2nd step
      await handleSecondStep(entry);

      // 3rd step
      await handleThirdStep(entry);

      //4th step
      await chrome.storage.local.set({ manualStart: false, startIndex: ++startIndex });

      await spinnerFinish();
      if (startIndex <= endIndex++) {
        start();
      } else {
        console.log('Automation finished');
      }
    } catch (err) {
      console.log('Error:', err);
      alert('Error , please check the console');
    }
  })();

  async function handleFirstStep(entry) {
    await stepChange('Step 1');
    let inputs = Array.from(document.querySelectorAll('input'));
    setNativeValue(inputs[0], entry['Product']);
    setNativeValue(inputs[1], entry['Standard Brokerage/mt']);
    setNativeValue(inputs[2], entry['Default Price']);
    setNativeValue(inputs[3], entry['Default Volume']);
    setNativeValue(inputs[4], entry['Minimum Price Increment']);
    setNativeValue(inputs[5], entry['Governing Body']);
    setNativeValue(inputs[7], entry['Governing Body Contract No.']);
    setNativeValue(inputs[9], entry['Product Abbreviation']);
    setNativeValue(inputs[10], entry['Volume Increment']);
    setNativeValue(inputs[11], entry['Inco Term']);
    setNativeValue(inputs[6], entry['Currency']); // selector

    let CurrencyOption = await Selector('.select__option');
    CurrencyOption.click();

    await delay(1000);

    document.querySelector('button[type="submit"]').click();
  }

  async function handleSecondStep(entry) {
    await stepChange('Step 2');
    let step2Inputs = document.querySelectorAll('input');

    setNativeValue(step2Inputs[0], entry['Location']);
    let countryOption = await Selector('.select__option');
    countryOption.click();

    setNativeValue(step2Inputs[1], entry['Expiry Date']);
    let expiryOption = await Selector('.select__option');
    expiryOption.click();

    setNativeValue(step2Inputs[2], entry['Timzone']);
    let TimeZoneOption = await Selector('.select__option');
    TimeZoneOption.click();

    setNativeValue(step2Inputs[3], entry['Limit Move']);

    simulateClick(step2Inputs[4]);
    setNativeValue(step2Inputs[4], entry['Trading Open (Local)'].replace('h', ':'));
    document.querySelectorAll('.ant-btn')[0].click();

    simulateClick(step2Inputs[5]);
    setNativeValue(step2Inputs[5], entry['Midday LAV (Last Assessed Value) Time'].replace('h', ':'));
    document.querySelectorAll('.ant-btn')[1].click();

    simulateClick(step2Inputs[6]);
    setNativeValue(step2Inputs[6], entry['Trading Close Time'].replace('h', ':'));
    document.querySelectorAll('.ant-btn')[2].click();

    await delay(1000);

    document.querySelector('button[type="submit"]').click();
  }

  async function handleThirdStep(entry) {
    await stepChange('Step 3');

    let step3Inputs = Array.from(document.querySelectorAll('input'));

    setNativeValue(step3Inputs[0], entry['Reference Exchange']);
    setNativeValue(step3Inputs[1], entry['Product name Full']);
    setNativeValue(step3Inputs[2], entry['Basis (location)']);
    setNativeValue(step3Inputs[3], entry['Specifications']);
    setNativeValue(step3Inputs[4], entry['Payment']);

    let otherTerms = document.querySelector('textarea');
    setNativeValue(otherTerms, entry['Other Terms']);

    setNativeValue(step3Inputs[5], 'soybeans');
    let productType = await Selector('.select__option');
    productType.click();

    await delay(1000);
    document.querySelector('button[type="submit"]').click();
  }

  function setNativeValue(element, value) {
    let lastValue = element.value;
    element.value = value;
    let event = new Event('input', { target: element, bubbles: true });
    // React 15
    event.simulated = true;
    // React 16
    let tracker = element._valueTracker;
    if (tracker) {
      tracker.setValue(lastValue);
    }
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(event);
  }

  async function Selector(selector) {
    return new Promise((r) => {
      let interval = setInterval(() => {
        let target = document.querySelector(selector);
        if (target) {
          clearInterval(interval);
          r(target);
        }
      }, 200);
    });
  }

  async function stepChange(targetStepName) {
    return new Promise((r) => {
      let interval = setInterval(() => {
        let currentStep = document.querySelector('.doneStep').children[1].innerText;
        if (currentStep === targetStepName) {
          clearInterval(interval);
          console.log(targetStepName + ' active');
          r(true);
        }
      }, 200);
    });
  }

  async function delay(timeout) {
    return new Promise((r) =>
      setTimeout(() => {
        r();
      }, timeout)
    );
  }

  function simulateClick(element) {
    element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    element.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));

    return true;
  }

  async function spinnerFinish() {
    let spinnerStarted = false;
    return new Promise((r) => {
      let interval = setInterval(() => {
        let spinning = document.querySelector('.ant-spin-spinning');
        if (spinning) spinnerStarted = true;
        if (!spinning && spinnerStarted) {
          clearInterval(interval);
          console.log('spinner Finished');
          r(true);
        }
      }, 50);
    });
  }
}

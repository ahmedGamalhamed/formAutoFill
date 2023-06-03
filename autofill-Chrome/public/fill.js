(async () => {
  let storageTarget = await chrome.storage.local.get('targetProfile');
  let targetProfile = storageTarget.targetProfile;

  let storageProfiles = await chrome.storage.local.get('profiles');
  if (!storageProfiles)
    return alert('No Profiles exists please connect to the internet');
  let profiles = storageProfiles.profiles;
  let profile = profiles.find(
    (profile) =>
      profile.profileNumber.toLowerCase() == targetProfile.toLowerCase()
  );
  if (!profile) return alert('This profile doesnt exist');
  console.log(profile);

  const selectors = {
    firstName: document.querySelector('[aria-label="First name:"]'),
    lastName: document.querySelector('[aria-label="Last name:"]'),
    companyName: document.querySelector('[aria-label="Company Name:"]'),
    emailAddress: document.querySelector('[aria-label="Email address:"]'),
    description: document.querySelector(
      '[aria-label="Enter your description here"]'
    ),
    searchTerms: document.querySelector(
      '[aria-label="Term(s) you used to conduct the image search:"]'
    ),
    exampleUrl: document.querySelector(
      '[aria-label="Enter your examples here"]'
    ),
    locationOfInfrigment: document.querySelector(
      '[aria-label="Enter your URL(s) here"]'
    ),
    signature: document.querySelector('[aria-label="Signature:"]'),
  };

  console.log(selectors);

  // set country

  const countryDropDown = document.querySelector('[aria-haspopup="listbox"]');
  if (
    countryDropDown.children[1].textContent.toLowerCase() !=
    profile.country.toLowerCase()
  ) {
    countryDropDown.click();
    let options = await WaitForQueryAll('material-select-dropdown-item');
    let country = Array.from(options).find(
      (option) =>
        option.innerText.toLowerCase() == profile.country.toLowerCase()
    );
    country.click();
  }

  // fill text
  for (let key in selectors) {
    let selector = selectors[key];
    if (selector) {
      console.log(key, selector, profile[key]);
      setNativeValue(selector, profile[key]);
    }
  }

  // check boxes
  const checkBoxes = document.querySelectorAll('[role="checkbox"]');
  for (let check of checkBoxes) {
    if (
      check.ariaChecked == 'false' &&
      !check.parentElement.children[1].textContent.includes(
        "I'm unable to provide landing page"
      )
    )
      check.click();
  }
  // radio
  const radios = Array.from(document.querySelectorAll('material-radio'));
  const unAuthorizedRadio = radios.find(
    (radio) =>
      radio.children[1].textContent.toLowerCase() ==
      profile.unauthorizedStream.toLowerCase()
  );
  unAuthorizedRadio.click();

  // set date
  const dateDropDown = document.querySelector('[aria-label^="Signed on this"]');
  let currentDate = new Date(
    dateDropDown.children[1].textContent
  ).toLocaleDateString('en-us');
  let profileDate = new Date(profile.date).toLocaleDateString('en-us');
  if (currentDate != profileDate) {
    dateDropDown.click();
    let dateInput = await WaitForQueryAll('.popup-content');
    dateInput = dateInput[0].querySelector('input');
    setNativeValue(dateInput, profileDate);
  }
})();
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
function PauseFor(timer) {
  //console.log("Pausing For ", timer);
  return new Promise((resolved) => {
    setTimeout(() => {
      resolved();
    }, timer);
  });
}
async function WaitForQueryAll(selector, Qinterval = 500, killcount = '') {
  return new Promise((resolve, reject) => {
    let y,
      tries = 0;
    y = setInterval(() => {
      //console.log(tries)
      tries++;
      let x;
      try {
        x = document.querySelectorAll(selector);
      } catch {
        x = [];
      }
      if (x[0]) {
        clearInterval(y);
        //console.log("solved", x);
        resolve(x);
      } else if (killcount && tries > killcount) {
        //  console.log("killed",x)
        clearInterval(y);
        console.log('Killed...', selector);
        resolve('killed');
      }
      {
        //console.log("Not found restart", selector);
      }
    }, Qinterval);
  });
}

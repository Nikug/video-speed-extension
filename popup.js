const rateElement = document.getElementById("rate");
const modeElement = document.getElementById("mode");
const thresholdElement = document.getElementById("threshold");

const setup = async () => {
  const rate = await browser.storage.local.get("rate");
  rateElement.value = rate?.rate ?? 0.1;

  const laptopMode = await browser.storage.local.get("laptopMode");
  modeElement.checked = laptopMode?.laptopMode ?? false;

  const threshold = await browser.storage.local.get("threshold");
  thresholdElement.value = threshold?.threshold ?? 20;
  thresholdElement.disabled = !laptopMode?.laptopMode;

  rateElement.addEventListener("input", handleRateChange);
  modeElement.addEventListener("change", handleModeChange);
  thresholdElement.addEventListener("input", handleThresholdChange);
};

const handleRateChange = async (event) => {
  const number = Number(event.target.value);

  if (isNaN(number) || event.target.value === "") {
    rateElement.classList.add("invalid");
    return;
  }

  await browser.storage.local.set({ rate: number });
  rateElement.classList.remove("invalid");
};

const handleModeChange = async (event) => {
  const enabled = event.target.checked;
  await browser.storage.local.set({ laptopMode: enabled });
  thresholdElement.disabled = !enabled;
};

const handleThresholdChange = async (event) => {
  const number = Number(event.target.value);

  if (isNaN(number) || event.target.value === "") {
    thresholdElement.classList.add("invalid");
    return;
  }

  await browser.storage.local.set({ threshold: number });
  thresholdElement.classList.remove("invalid");
};

setup();

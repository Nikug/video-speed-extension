const rateElement = document.getElementById("rate");
const modeElement = document.getElementById("mode");

const setup = async () => {
  const rate = await browser.storage.local.get("rate");
  rateElement.value = rate?.rate ?? 0.1;

  const laptopMode = await browser.storage.local.get("laptopMode");
  modeElement.checked = laptopMode?.laptopMode ?? false;
};

const handleRateChange = async (event) => {
  if (!rateElement) return;

  const number = Number(event.target.value);

  if (isNaN(number) || event.target.value === "") {
    rateElement.classList.add("invalid");
    return;
  }

  await browser.storage.local.set({ rate: number });
  rateElement.classList.remove("invalid");
};

const handleModeChange = async (event) => {
  if (!modeElement) return;

  const enabled = event.target.checked;
  await browser.storage.local.set({ laptopMode: enabled });
};

rateElement.addEventListener("input", handleRateChange);
modeElement.addEventListener("change", handleModeChange);
setup();

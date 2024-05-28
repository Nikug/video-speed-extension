const rateElement = document.getElementById("rate");

const setup = async () => {
  const rate = await browser.storage.local.get("rate");
  rateElement.value = rate?.rate ?? 0.1;
};

const handleChange = async (event) => {
  if (!rateElement) return;

  const number = Number(event.target.value);

  if (isNaN(number) || event.target.value === "") {
    rateElement.classList.add("invalid");
    return;
  }

  await browser.storage.local.set({ rate: number });
  rateElement.classList.remove("invalid");
};

rateElement.addEventListener("input", handleChange);
setup();

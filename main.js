let rateStep = 0.1;
let laptopMode = false;
let videoElement = null;
let rateElement = null;
let timeout = null;
const hideRateElementDelay = 500;

let originalPlaybackRate = 1;
let scrolledDistance = 0;
let clearDistanceTimeout = null;
const clearDistanceDelay = 500;
const distanceThreshold = 15;

const setup = async () => {
  const storedRate = await browser.storage.local.get("rate");
  rateStep = storedRate?.rate ?? 0.1;

  const storedLaptopMode = await browser.storage.local.get("laptopMode");
  laptopMode = storedLaptopMode?.laptopMode ?? false;
};

const showCurrentRate = () => {
  if (!videoElement) return;
  if (rateElement) {
    removeRateElement();
  }

  const element = document.createElement("div");
  element.textContent = `${videoElement.playbackRate.toFixed(2)}x`;
  element.style.padding = "0.5rem";
  element.style.position = "absolute";
  element.style.top = "4rem";
  element.style.left = 0;
  element.style.right = 0;
  element.style.margin = "auto";
  element.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  element.style.color = "white";
  element.style.fontSize = "2rem";
  element.style.borderRadius = "0.5rem";
  element.style.width = "fit-content";
  rateElement = videoElement.parentNode.appendChild(element);

  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => removeRateElement(), hideRateElementDelay);
};

const removeRateElement = () => {
  if (rateElement) {
    rateElement.remove();
    rateElement = null;
  }
};

const quantize = (value, amount) => {
  if (amount === 0) return value;
  return Math.round(value / amount) * amount;
};

const handleWheel = async (event) => {
  if (!event.ctrlKey) return;

  if (event.target.localName === "video") {
    videoElement = event.target;
  } else {
    videoElement = document
      .elementsFromPoint(event.clientX, event.clientY)
      .find((element) => element.localName === "video");
  }

  if (videoElement) {
    event.preventDefault();

    if (laptopMode) {
      scrolledDistance += event.deltaY;

      if (clearDistanceTimeout) clearTimeout(clearDistanceTimeout);
      clearDistanceTimeout = setTimeout(() => {
        scrolledDistance = 0;
        clearDistanceTimeout = null;
        originalPlaybackRate = videoElement.playbackRate;
      }, clearDistanceDelay);

      const steps = Math.round(scrolledDistance / distanceThreshold);
      const newRate = quantize(
        originalPlaybackRate - steps * rateStep,
        rateStep,
      );
      videoElement.playbackRate = newRate >= 0 ? newRate : 0;
    } else {
      const newSpeed =
        videoElement.playbackRate - Math.sign(event.deltaY) * rateStep;
      const newRate = quantize(newSpeed, rateStep);
      videoElement.playbackRate = newRate >= 0 ? newRate : 0;
    }
    showCurrentRate();
  }
};

document.addEventListener("wheel", handleWheel, {
  passive: false,
  capture: true,
});

browser.storage.onChanged.addListener((changes) => {
  if (changes.rate != null) {
    rateStep = changes.rate.newValue;
  }
  if (changes.laptopMode != null) {
    laptopMode = changes.laptopMode.newValue;
  }
});

setup();

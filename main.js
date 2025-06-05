let rateStep = 0.1;
let videoElement = null;
let rateElement = null;
let timeout = null;

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
  timeout = setTimeout(() => removeRateElement(), 500);
};

const removeRateElement = () => {
  if (rateElement) {
    rateElement.remove();
    rateElement = null;
  }
};

const quantize = (value, amount) => Math.round(value / amount) * amount;

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
    const newSpeed =
      videoElement.playbackRate - Math.sign(event.deltaY) * rateStep;
    videoElement.playbackRate = quantize(newSpeed, rateStep);
    showCurrentRate();
  }
};

document.addEventListener("wheel", handleWheel, {
  passive: false,
  capture: true,
});

browser.storage.onChanged.addListener((changes) => {
  if (changes.rate) {
    rateStep = changes.rate.newValue;
  }
});

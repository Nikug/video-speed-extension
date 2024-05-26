const speedchange = 0.1;
let videoElement = null;
let rateElement = null;
let timeout = null;

const showCurrentRate = () => {
  if (!videoElement) return;
  if (rateElement) {
    removeRateElement();
  }

  const element = document.createElement("div");
  element.innerHTML = `${videoElement.playbackRate.toFixed(2)}x`;
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

const quantize = (num) => Math.round(num / speedchange) * speedchange;

const handleWheel = (event) => {
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
      videoElement.playbackRate - Math.sign(event.deltaY) * speedchange;
    videoElement.playbackRate = quantize(newSpeed);
    showCurrentRate();
  }
};

document.addEventListener("wheel", handleWheel, { passive: false });

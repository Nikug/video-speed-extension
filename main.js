let rateStep = 0.1;
let laptopMode = false;
let videoElement = null;
let rateElement = null;
let timeout = null;
const hideRateElementDelay = 500;

// Laptop mode variables
let originalPlaybackRate = null;
let scrolledDistance = 0;
let clearDistanceTimeout = null;
const clearDistanceDelay = 500;
let distanceThreshold = 20;

const videoElements = new WeakSet();

const setup = async () => {
  const storedRate = await browser.storage.local.get("rate");
  rateStep = storedRate?.rate ?? 0.1;

  const storedLaptopMode = await browser.storage.local.get("laptopMode");
  laptopMode = storedLaptopMode?.laptopMode ?? false;

  const storedThreshold = await browser.storage.local.get("threshold");
  distanceThreshold = storedThreshold?.threshold ?? 20;

  browser.storage.onChanged.addListener((changes) => {
    if (changes.rate != null) {
      rateStep = changes.rate.newValue;
    }
    if (changes.laptopMode != null) {
      laptopMode = changes.laptopMode.newValue;
    }
    if (changes.threshold != null) {
      distanceThreshold = changes.threshold.newValue;
    }
  });

  // Initialize with existing video elements
  document.querySelectorAll("video").forEach(addWheelListener);

  // Observe for new video elements
  const observer = new MutationObserver(handleMutations);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
};

const addWheelListener = (videoElement) => {
  if (videoElements.has(videoElement)) return;
  videoElements.add(videoElement);
  videoElement.addEventListener("wheel", handleWheel, {
    passive: false,
    capture: true,
  });
};

const handleMutations = (mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!node || node.nodeType !== Node.ELEMENT_NODE) {
        continue;
      } else if (node.tagName === "VIDEO") {
        addWheelListener(node);
      } else {
        const videos = node.getElementsByTagName("video");
        for (const video of videos) {
          addWheelListener(video);
        }
      }
    }
  }
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
  if (event.target.tagName !== "VIDEO") return;
  videoElement = event.target;

  event.preventDefault();
  event.stopPropagation();

  if (laptopMode) {
    originalPlaybackRate ??= videoElement.playbackRate;
    scrolledDistance += event.deltaY;

    if (clearDistanceTimeout) clearTimeout(clearDistanceTimeout);
    clearDistanceTimeout = setTimeout(() => {
      scrolledDistance = 0;
      clearDistanceTimeout = null;
      originalPlaybackRate = null;
    }, clearDistanceDelay);

    const steps = Math.round(scrolledDistance / distanceThreshold);
    const newRate = quantize(originalPlaybackRate - steps * rateStep, rateStep);
    videoElement.playbackRate = newRate >= 0 ? newRate : 0;
  } else {
    const newSpeed =
      videoElement.playbackRate - Math.sign(event.deltaY) * rateStep;
    const newRate = quantize(newSpeed, rateStep);
    videoElement.playbackRate = newRate >= 0 ? newRate : 0;
  }

  showCurrentRate();
};

setup();

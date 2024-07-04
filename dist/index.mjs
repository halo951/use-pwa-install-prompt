var EInstallState = /* @__PURE__ */ ((EInstallState2) => {
  EInstallState2["unready"] = "unready";
  EInstallState2["ready"] = "ready";
  EInstallState2["installed"] = "installed";
  return EInstallState2;
})(EInstallState || {});
let deferredPrompt = void 0;
let firstTouchTime = void 0;
const listenFirstTouch = () => {
  const cb = () => {
    firstTouchTime = Date.now();
    window.removeEventListener("touchend", cb);
    window.removeEventListener("mouseup", cb);
  };
  window.addEventListener("touchend", cb, { once: true });
  window.addEventListener("mouseup", cb, { once: true });
};
const registerPWA = () => {
  window.addEventListener("beforeinstallprompt", (ev) => {
    ev.preventDefault();
    deferredPrompt = ev;
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
  });
  listenFirstTouch();
};
const pwaInstallIsReady = () => {
  if (!!deferredPrompt)
    return "ready" /* ready */;
  if (Date.now() - window.performance.timeOrigin > 32 * 1e3 && !!firstTouchTime) {
    return "installed" /* installed */;
  }
  return "unready" /* unready */;
};
const loopTask = (check, time, durcation) => {
  return new Promise((resolve) => {
    let end = Date.now() + time;
    let timer = setInterval(() => {
      if (check()) {
        clearInterval(timer);
        resolve(true);
      } else if (Date.now() - end > 0) {
        clearInterval(timer);
        resolve(false);
      }
    }, durcation || 1e3);
  });
};
const usePWAInstallPrompt = async (options) => {
  const status = pwaInstallIsReady();
  if (status === "ready" /* ready */ && deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = void 0;
    if (outcome === "accepted") {
      return true;
    } else {
      return false;
    }
  } else if (status === "unready" /* unready */ && options.delay) {
    const delayTime = Date.now() - (window.performance.timeOrigin + 32 * 1e3);
    if (delayTime < 0)
      return false;
    options.loading?.(true);
    const res = await loopTask(() => {
      return pwaInstallIsReady() === "ready" /* ready */;
    }, 32 * 1e3);
    options.loading?.(false);
    if (res)
      return usePWAInstallPrompt(options);
  }
  return false;
};

export { EInstallState, pwaInstallIsReady, registerPWA, usePWAInstallPrompt };

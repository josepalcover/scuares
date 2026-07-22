const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const CLOSE_FALLBACK_DELAY = 350;

export function createContactModal(scrollController) {
  const modal = document.querySelector("#contact-modal");
  const pageContent = document.querySelector("#page-content");

  if (!modal || !pageContent) return null;

  const listeners = new Set();
  let phase = "closed";
  let opener;
  let closeFallbackTimeout;

  function getState() {
    return {
      phase,
      isOpen: phase === "open",
      isClosing: phase === "closing",
    };
  }

  function notify() {
    const state = getState();
    listeners.forEach((listener) => listener(state));
  }

  function cancelClosing() {
    clearTimeout(closeFallbackTimeout);
    modal.removeEventListener("transitionend", handleModalTransitionEnd);
  }

  function finishClosing() {
    if (
      phase !== "closing" ||
      modal.classList.contains("contact-modal--open")
    ) {
      return;
    }

    cancelClosing();
    phase = "closed";
    pageContent.removeAttribute("inert");
    scrollController.unlock();
    notify();

    const focusTarget = opener;
    opener = undefined;
    if (focusTarget?.isConnected) {
      focusTarget.focus({ preventScroll: true });
    }
  }

  function handleModalTransitionEnd(event) {
    if (event.target === modal && event.propertyName === "opacity") {
      finishClosing();
    }
  }

  function open({ opener: nextOpener } = {}) {
    if (nextOpener instanceof HTMLElement) opener = nextOpener;
    if (phase === "open") return;

    if (phase === "closing") cancelClosing();

    phase = "open";
    scrollController.lock();
    modal.classList.add("contact-modal--open");
    modal.setAttribute("aria-hidden", "false");
    modal.removeAttribute("inert");
    pageContent.setAttribute("inert", "");
    notify();
  }

  function close() {
    if (phase !== "open") return;

    phase = "closing";
    modal.classList.remove("contact-modal--open");
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("inert", "");
    modal.addEventListener("transitionend", handleModalTransitionEnd);
    notify();

    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      requestAnimationFrame(finishClosing);
    } else {
      closeFallbackTimeout = setTimeout(finishClosing, CLOSE_FALLBACK_DELAY);
    }
  }

  function toggle(options = {}) {
    if (phase === "open") {
      close();
    } else {
      open(options);
    }
  }

  function isOpen() {
    return phase === "open";
  }

  function subscribe(listener) {
    listeners.add(listener);
    listener(getState());
    return () => listeners.delete(listener);
  }

  modal.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest(".text-box")) return;
    close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && phase === "open") close();
  });

  return { open, close, toggle, isOpen, subscribe };
}

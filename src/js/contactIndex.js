import { SINGLE_COLUMN_QUERY } from "../styles/breakpoints.js";
import { SCROLL_CONFIG } from "./scroll/config.js";

export function contactIndexInit(contactModal, scrollController) {
  if (!contactModal) return null;

  const navDockSection = document.querySelector(".nav-dock-section");
  const singleColumnLayout = window.matchMedia(SINGLE_COLUMN_QUERY);
  let isDockingForModal = false;

  function open(options = {}) {
    if (scrollController.isLocked) {
      contactModal.open(options);
      return;
    }

    const shouldDockFirst =
      singleColumnLayout.matches &&
      navDockSection &&
      navDockSection.getBoundingClientRect().top > 0;

    if (!shouldDockFirst) {
      contactModal.open(options);
      return;
    }

    if (isDockingForModal) return;
    isDockingForModal = true;

    const dockingTween = scrollController.scrollTo(navDockSection, {
      duration: SCROLL_CONFIG.slideAnimationDuration,
      ease: "power2.out",
      onComplete: () => {
        isDockingForModal = false;
        requestAnimationFrame(() => contactModal.open(options));
      },
      onInterrupt: () => {
        isDockingForModal = false;
      },
    });

    if (!dockingTween) isDockingForModal = false;
  }

  function toggle(options = {}) {
    if (contactModal.isOpen()) {
      contactModal.close();
    } else {
      open(options);
    }
  }

  return {
    open,
    close: contactModal.close,
    toggle,
    isOpen: contactModal.isOpen,
    subscribe: contactModal.subscribe,
  };
}

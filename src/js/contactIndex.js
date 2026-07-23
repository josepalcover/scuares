import { SCROLL_CONFIG } from "./scroll/config.js";
import { NAV_DOCK_ANCHOR_SELECTOR, syncNavDocking } from "./navDock.js";

const REPEAT_TOGGLE_GUARD_MS = 300;

export function contactIndexInit(contactModal, scrollController) {
  if (!contactModal) return null;

  const nav = document.querySelector(".nav-main");
  const navDockAnchor = document.querySelector(NAV_DOCK_ANCHOR_SELECTOR);
  let isDockingForModal = false;
  let ignoreToggleUntil = 0;

  function openModal(options) {
    contactModal.open(options);
    ignoreToggleUntil = performance.now() + REPEAT_TOGGLE_GUARD_MS;
  }

  function finishDocking(options, allowCorrection = true) {
    requestAnimationFrame(() => {
      const isDocked = syncNavDocking(nav, navDockAnchor);

      if (isDocked) {
        isDockingForModal = false;
        openModal(options);
        return;
      }

      if (allowCorrection) {
        const correctionTween = scrollController.scrollTo(navDockAnchor, {
          duration: 0,
          autoKill: false,
          onComplete: () => finishDocking(options, false),
          onInterrupt: () => {
            isDockingForModal = false;
          },
        });

        if (correctionTween) return;
      }

      isDockingForModal = false;
    });
  }

  function open(options = {}) {
    if (contactModal.isOpen() || isDockingForModal) return;

    if (scrollController.isLocked) {
      openModal(options);
      return;
    }

    if (!navDockAnchor || syncNavDocking(nav, navDockAnchor)) {
      openModal(options);
      return;
    }

    isDockingForModal = true;

    const dockingTween = scrollController.scrollTo(navDockAnchor, {
      duration: SCROLL_CONFIG.slideAnimationDuration,
      ease: "power2.out",
      autoKill: false,
      onComplete: () => finishDocking(options),
      onInterrupt: () => {
        isDockingForModal = false;
      },
    });

    if (!dockingTween) isDockingForModal = false;
  }

  function toggle(options = {}) {
    if (isDockingForModal || performance.now() < ignoreToggleUntil) return;

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

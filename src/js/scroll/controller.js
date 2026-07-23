import { gsap } from "../gsap.js";
import { SCROLL_CONFIG } from "./config.js";
import { createScrollObserver } from "./observer.js";
import { createScrollSnapping } from "./snapping.js";

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  '[role="button"]',
  "[data-scroll-ignore]",
].join(", ");

export function createScrollController({
  resolveAnchorOffset = () => 0,
  onSlideModeExit,
} = {}) {
  const slides = gsap.utils.toArray(SCROLL_CONFIG.slideSelector);
  const scrollTargets = document.querySelectorAll("[data-scroll-target]");

  let currentIndex = 0;
  let slideModeActive = false;
  let scrollingLocked = document.documentElement.classList.contains(
    SCROLL_CONFIG.lockClass,
  );
  let pageScrollTween;
  let observer;
  let snapTrigger;

  const clampIndex = (index) =>
    Math.max(0, Math.min(index, Math.max(0, slides.length - 1)));

  const controller = {
    get index() {
      return currentIndex;
    },
    get isSlideMode() {
      return slideModeActive;
    },
    get isLocked() {
      return scrollingLocked;
    },
    get slideCount() {
      return slides.length;
    },
    syncIndex,
    scrollTo,
    scrollToSlide,
    capturePosition,
    restorePosition,
    lock,
    unlock,
    destroy,
  };

  function syncIndex() {
    const viewportHeight = window.innerHeight;
    if (viewportHeight > 0) {
      currentIndex = clampIndex(Math.floor(window.scrollY / viewportHeight));
    }
    return currentIndex;
  }

  function getTargetPosition(target) {
    if (typeof target === "number") return target;

    const element =
      target instanceof Element ? target : document.querySelector(target);
    if (!element) return null;

    const offset = Number(
      resolveAnchorOffset({
        target,
        element,
        isSlideMode: slideModeActive,
      }),
    );

    return (
      window.scrollY +
      element.getBoundingClientRect().top -
      (Number.isFinite(offset) ? offset : 0)
    );
  }

  function scrollTo(
    target,
    {
      duration = SCROLL_CONFIG.navigationAnimationDuration,
      ease,
      autoKill = true,
      onStart,
      onComplete,
      onInterrupt,
      finalIndex,
    } = {},
  ) {
    if (scrollingLocked) return null;

    const y = getTargetPosition(target);
    if (y === null) return null;

    pageScrollTween?.kill();

    let tween;
    tween = gsap.to(window, {
      scrollTo: { y, autoKill },
      duration,
      ease,
      overwrite: "auto",
      onStart,
      onComplete: () => {
        if (pageScrollTween === tween) pageScrollTween = undefined;

        // Explicit navigation disables autoKill so mobile viewport movement
        // cannot abort it. Re-read the destination once loading has settled
        // and correct any small drift before announcing completion.
        if (!autoKill) {
          const settledY = getTargetPosition(target);
          if (settledY !== null && Math.abs(window.scrollY - settledY) > 1) {
            window.scrollTo(window.scrollX, settledY);
          }
        }

        currentIndex =
          finalIndex === undefined ? syncIndex() : clampIndex(finalIndex);
        onComplete?.();
      },
      onInterrupt: () => {
        if (pageScrollTween === tween) pageScrollTween = undefined;
        syncIndex();
        onInterrupt?.();
      },
    });
    pageScrollTween = tween;

    return tween;
  }

  function scrollToSlide(index, options = {}) {
    if (scrollingLocked) return null;

    const nextIndex = clampIndex(index);
    currentIndex = nextIndex;

    return scrollTo(nextIndex * window.innerHeight, {
      ...options,
      duration:
        options.duration ?? SCROLL_CONFIG.slideAnimationDuration,
      finalIndex: nextIndex,
    });
  }

  function capturePosition() {
    return { index: currentIndex, scrollY: window.scrollY };
  }

  function restorePosition(position) {
    if (!position) return null;

    return scrollTo(position.scrollY, {
      duration: 0,
      autoKill: false,
      finalIndex: position.index,
    });
  }

  function lock() {
    if (scrollingLocked) return;

    scrollingLocked = true;
    document.documentElement.classList.add(SCROLL_CONFIG.lockClass);
    pageScrollTween?.kill();
    pageScrollTween = undefined;
    gsap.killTweensOf(window);
    snapTrigger?.getTween?.()?.kill();
    snapTrigger?.disable(false);
  }

  function unlock() {
    if (!scrollingLocked) return;

    scrollingLocked = false;
    document.documentElement.classList.remove(SCROLL_CONFIG.lockClass);
    syncIndex();
    snapTrigger?.enable(false, false);
  }

  function handleScrollTargetClick(event) {
    const origin = event.target;
    if (!(origin instanceof Element) || origin.closest(INTERACTIVE_SELECTOR)) {
      return;
    }

    const target = event.currentTarget.dataset.scrollTarget;
    if (!target) return;

    scrollTo(target, {
      duration: SCROLL_CONFIG.slideAnimationDuration,
      autoKill: false,
    });
  }

  scrollTargets.forEach((element) => {
    element.addEventListener("click", handleScrollTargetClick);
  });

  const mediaContext = gsap.matchMedia();
  mediaContext.add(SCROLL_CONFIG.slideMediaQuery, () => {
    slideModeActive = true;
    syncIndex();

    if (observer) {
      observer.enable();
    } else {
      observer = createScrollObserver(controller);
    }

    snapTrigger = createScrollSnapping(controller);
    if (scrollingLocked) snapTrigger?.disable(false);

    return () => {
      pageScrollTween?.kill();
      pageScrollTween = undefined;
      observer?.disable();
      snapTrigger?.kill();
      snapTrigger = undefined;
      slideModeActive = false;
      syncIndex();
      onSlideModeExit?.();
    };
  });

  function destroy() {
    mediaContext.revert();
    observer?.kill();
    pageScrollTween?.kill();
    scrollTargets.forEach((element) => {
      element.removeEventListener("click", handleScrollTargetClick);
    });
  }

  return controller;
}

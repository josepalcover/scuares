import { ScrollTrigger } from "../gsap.js";
import { SCROLL_CONFIG } from "./config.js";

export function createScrollObserver(scrollController) {
  let animating = false;
  let allowRepeat = true;
  let velocityOnComplete = 0;
  let velocityPrevious = 0;

  const observer = ScrollTrigger.observe({
    type: "wheel",
    wheelSpeed: SCROLL_CONFIG.observer.wheelSpeed,
    onDown: (self) => {
      if (!scrollController.isLocked && allowRepeat && !animating) {
        goToSection(1, self.velocityY);
      }
    },
    onUp: (self) => {
      if (!scrollController.isLocked && allowRepeat && !animating) {
        goToSection(-1, self.velocityY);
      }
    },
    tolerance: SCROLL_CONFIG.observer.tolerance,
    preventDefault: true,
  });

  function goToSection(increment, velocityCurrent) {
    allowRepeat = false;
    window.setTimeout(() => {
      velocityPrevious = observer.velocityY;
      allowRepeat = true;
    }, SCROLL_CONFIG.observer.repeatDelay);

    function scroll() {
      scrollController.scrollToSlide(scrollController.index + increment, {
        onStart: () => {
          animating = true;
        },
        onComplete: () => {
          animating = false;
          velocityOnComplete = observer.velocityY;
        },
        onInterrupt: () => {
          animating = false;
        },
      });
    }

    if (velocityCurrent === 0) {
      scroll();
      return;
    }

    if (Math.abs(velocityCurrent) > Math.abs(velocityOnComplete)) {
      scroll();
      return;
    }

    if (
      Math.abs(velocityCurrent) >
      SCROLL_CONFIG.observer.inertiaComparisonMultiplier *
        Math.abs(velocityPrevious)
    ) {
      scroll();
      return;
    }

    if (
      (velocityCurrent > 0 && velocityOnComplete < 0) ||
      (velocityCurrent < 0 && velocityOnComplete > 0)
    ) {
      scroll();
    }
  }

  return observer;
}

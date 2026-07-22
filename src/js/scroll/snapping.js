import { ScrollTrigger } from "../gsap.js";
import { SCROLL_CONFIG } from "./config.js";

export function createScrollSnapping(scrollController) {
  const snapDivisions = scrollController.slideCount - 1;
  if (snapDivisions < 1) return null;

  return ScrollTrigger.create({
    start: 0,
    end: "max",
    invalidateOnRefresh: true,
    snap: {
      snapTo: 1 / snapDivisions,
      delay: SCROLL_CONFIG.snap.delay,
      duration: SCROLL_CONFIG.snap.duration,
      ease: SCROLL_CONFIG.snap.ease,
      inertia: SCROLL_CONFIG.snap.inertia,
      directional: SCROLL_CONFIG.snap.directional,
    },
    onSnapComplete: () => scrollController.syncIndex(),
  });
}

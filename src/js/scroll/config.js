import { SLIDES_QUERY } from "../../styles/breakpoints.js";

export const SCROLL_CONFIG = Object.freeze({
  slideSelector: ".snap",
  slideAnimationDuration: 0.5,
  navigationAnimationDuration: 1,
  slideMediaQuery: SLIDES_QUERY,
  lockClass: "contact-modal-open",
  observer: Object.freeze({
    wheelSpeed: 1,
    tolerance: 0.5,
    repeatDelay: 150,
    inertiaComparisonMultiplier: 1.4,
  }),
  snap: Object.freeze({
    delay: 0,
    duration: 0.5,
    ease: "sine",
    inertia: false,
    directional: true,
  }),
});

import { state } from "./state.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export function scrollSnapping() {
  // SCROLL SNAPPING (every 100% height)

  const num_snap_divisions = gsap.utils.toArray(".snap").length - 1;
  ScrollTrigger.create({
    start: 0,
    end: "max",

    snap: {
      // snap every section
      snapTo: 1 / num_snap_divisions,

      delay: 0,
      duration: 0.5,
      ease: "sine",
      inertia: false,
      directional: true,
    },

    // update index so we can continue with scrolling animations
    onSnapComplete: () => {
      state.index = Math.floor(window.scrollY / innerHeight);
    },
  });
}

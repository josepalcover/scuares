gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { state } from "./state.js";

export function navInit() {
  //////////////////
  // LINKS - SCROLL TO

  const nav = document.querySelector(".nav");

  nav.addEventListener("click", (e) => {
    e.preventDefault();

    const clickedLink = e.target.closest(".link");
    if (!clickedLink) return;
    let goTo = clickedLink.dataset.goto;

    // only if we are in slides mode, we replace the ID with the actual // scroll position because otherwise it doesn't work
    if (state.slides === true) {
      // if (goTo === "#about") goTo = 1 * window.innerHeight;
      //if (goTo === "#films") goTo = 3 * window.innerHeight;
    }

    gsap.to(window, {
      scrollTo: goTo,
      duration: 1,
      onComplete: () => {
        // update index so we can continue with the scrolling animations
        state.index = Math.floor(window.scrollY / innerHeight);
      },
    });
  });
  // click hero and scroll to about (always, even in portrait)
  const hero = document.querySelector("#home");

  hero?.addEventListener("click", () => {
    gsap.to(window, {
      scrollTo: "#about",
      duration: 0.5,
      onComplete: () => {
        state.index = 1;
      },
    });
  });
}

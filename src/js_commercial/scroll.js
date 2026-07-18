// register plugins to avoid problems with tree shaking
// when using build tools
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import { scrollObserver } from "./scrollObserver.js";
import { scrollSnapping } from "./scrollSnapping.js";
import { state } from "./state.js";
import { setContactBtnVisibilityFromSection } from "./nextAndContactBtn.js";

export function scrollInit() {
  ////////////////////////////
  // GSAP defaults

  // for tweens
  gsap.defaults({ duration: 1 });

  // for scrollTrigger
  ScrollTrigger.defaults({
    start: "top bottom",
    end: "+=100%",
    toggleActions: "restart pause pause reverse",
    invalidateOnRefresh: true,
  });

  // create observer (then we will enable or disable it)
  const observer = scrollObserver();
  observer.disable(); //we create the observer and imediately disable it

  ///// MATCH MEDIA (animations only on landscape mode)
  let mm = gsap.matchMedia();

  mm.add(
    "(min-width: 800px) and (min-aspect-ratio: 1.3) and (max-aspect-ratio: 3/1) and (min-height: 450px)",
    () => {
      // slides mode = true

      state.slides = true;
      // save current scroll index in case we come from
      // another match media case without observer
      state.index = Math.floor(window.scrollY / innerHeight);

      // observer-based scroll-to animation
      observer.enable();

      // activagte snapping so it works on touch devices
      scrollSnapping();

      ScrollTrigger.refresh();

      return () => {
        // cleanup function

        gsap.set("#films", { clearProps: true });
        gsap.set(".films-main", { clearProps: true });
        gsap.set(".films-proj", { clearProps: true });
        gsap.set("#images", { clearProps: true });
        gsap.set(".images", { clearProps: true });
        gsap.set("#tours", { clearProps: true });
        gsap.set(".tours-main", { clearProps: true });
        gsap.set(".tours-proj", { clearProps: true });

        ScrollTrigger.refresh();
        observer.disable();
        state.slides = false;

        document
          .querySelector(".pano-overlay")
          .classList.remove("pano-overlay-hidden");
      };
    },
  );

  // non-slides (mobile): IntersectionObserver for contact button visibility on native scroll
  mm.add(
    "(max-aspect-ratio: 1.3), (max-width: 800px), (max-height: 450px)",
    () => {
      const contactSection = document.querySelector("#contact");
      if (!contactSection) return () => {};

      const contactObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            setContactBtnVisibilityFromSection(entry.isIntersecting);
          }
        },
        { threshold: 0.1 },
      );

      contactObserver.observe(contactSection);

      // Initial check in case page loads in contact section
      const rect = contactSection.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      setContactBtnVisibilityFromSection(inView);

      return () => {
        contactObserver.disconnect();
      };
    },
  );
}

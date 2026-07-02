gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import { state } from "./state.js";

export function scrollObserver() {
  // scroll fullpage animation using Observer
  let animating = false;
  let allowRepeat = true; //to debounce
  let timeRepeat = 150; //for the timer to set the previous velocity and allow repeat

  let velocityOnComplete = 0; //velocity after finishing an animation
  let velocityPrevious = 0; //velocity after erach event trigger, debounced

  const num_snap_pages = gsap.utils.toArray(".snap").length - 1;
  // the same as Observer.create()
  // but without having to load observer separately
  const observer = ScrollTrigger.observe({
    type: "wheel", //only for wheel
    wheelSpeed: 1, //slowing the wheel so the trackpad goes slower
    onEnable: () => goToSection(0, 0),

    onDown: (self) =>
      allowRepeat && !animating && goToSection(1, self.velocityY),
    onUp: (self) =>
      allowRepeat && !animating && goToSection(-1, self.velocityY),

    tolerance: 0.5,
    preventDefault: true,
  });

  function goToSection(increment, velocityCurrent) {
    // repeating logic /debouncing
    // after certain time allow repeat and set previous velocity
    allowRepeat = false;
    setTimeout(() => {
      velocityPrevious = observer.velocityY;
      allowRepeat = true;
    }, timeRepeat);

    // scroll function
    function scroll() {
      state.index += increment;

      // keep the state.index between 0 and number of pages
      if (state.index < 0) state.index = 0;
      if (state.index > num_snap_pages) state.index = num_snap_pages;
      // gsap scrolling animation
      gsap.to(window, {
        scrollTo: state.index * innerHeight,
        duration: 0.5,
        onStart: () => {
          animating = true;
        },
        onComplete: () => {
          animating = false;
          velocityOnComplete = observer.velocityY;
        },
      });
    }
    ////////////

    // CONDITIONS
    // basically dealing with the problem that trackpads
    // have inertia and the scrolling continues on its own
    // even afer a page animation is complete

    // if scrolling was stopped and we start.
    // this happens always with wheel but not
    // with trackpad that has inertia
    if (velocityCurrent === 0) {
      scroll();
      return;
    }

    // in case of inertia even after the animation completed
    // if the new velocity is lower than the velocity when the animation
    // completed. It usually means that it is not user generated
    // and it is only the scrolling stopping slowly
    // so we only trigger if the new velocity is higher that the one on complete
    if (Math.abs(velocityCurrent) > Math.abs(velocityOnComplete)) {
      scroll();
      return;
    }

    // in case the velocityOncomplete was very high, it is difficult
    // that the user generates again an even higher velocity
    // so we check the previous velocity and if we are x times higher than it
    // we trigger
    if (Math.abs(velocityCurrent) > 1.4 * Math.abs(velocityPrevious)) {
      scroll();
      return;
    }

    //if we are changing direction
    if (
      (velocityCurrent > 0 && velocityOnComplete < 0) ||
      (velocityCurrent < 0 && velocityOnComplete > 0)
    ) {
      scroll();
      return;
    }
  }

  // we return the observer so we can enable or disable it
  return observer;
}

import { state } from "./state.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

export function panosInit() {
  //hide pano overlay for dubai pano on click
  const panoOverlay = document.querySelector(".pano-overlay");
  panoOverlay.addEventListener("click", () => {
    panoOverlay.classList.add("pano-overlay-hidden");
  });
  //load krpano script
  // when loaded, create the panos
  let krpanoScript = document.createElement("script");
  krpanoScript.setAttribute("src", "/tours/krpano.js");
  krpanoScript.setAttribute("type", "text/javascript");
  document.body.appendChild(krpanoScript);

  krpanoScript.addEventListener("load", () => {
    // embed the panos
    embedpano({
      xml: "/tours/dubai/pano.xml",
      target: "pano-dubai", // the id of the div without #
    });

    embedpano({
      xml: "/tours/solaris/tour.xml",
      target: "pano-solaris", // the id without #
    });
    embedpano({
      xml: "/tours/vertigo/tour.xml",
      target: "pano-vertigo", // the id without #
    });

    //////MODAL WINDOW FOR PANO PROJECTS

    let toursPageIndex;
    let toursPageScrollY;

    // create the
    // gsap timelines
    const showModalToursTl = gsap
      .timeline({ paused: true })
      .fromTo(
        ".modal-tours",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2 }
      );

    const showModalTours = (project) => {
      toursPageIndex = state.index;
      toursPageScrollY = window.scrollY;
      tourModalActive = true;
      //hide all panos
      document
        .querySelectorAll(".modal-pano")
        .forEach((panoEl) => panoEl.classList.add("hidden"));
      //show the selected pano
      document.querySelector(`#pano-${project}`).classList.remove("hidden");
      // modal animation to show
      showModalToursTl.restart();
    };
    const hideModalTours = () => {
      tourModalActive = false;
      gsap.to(".modal-tours", {
        autoAlpha: 0,
        duration: 0.2,
        onComplete: () => {
          gsap.set(window, {
            scrollTo: { y: toursPageScrollY, autoKill: false },
          });
          state.index = toursPageIndex;
        },
      });
    };

    // load panos on modal windows
    const toursProjects = document.querySelector(".tours-proj");
    const btnClose = document.querySelector(".modal-tours .modal-close");

    let tourModalActive = false;
    toursProjects.addEventListener("click", (e) => {
      const projClicked = e.target.closest(".tour-item");
      if (!projClicked) return;
      const project = projClicked.dataset.project;
      showModalTours(project);
    });

    btnClose.addEventListener("click", () => {
      hideModalTours();
    });

    // also hide modal on escape
    window.addEventListener("keydown", function (e) {
      // close
      if (tourModalActive && e.key === "Escape") hideModalTours();
    });
  });
  // end of "load" event listener
}

import { gsap } from "./gsap.js";

export function panosInit(scrollController) {
  // Hide the cover panorama overlay on click.
  const panoOverlay = document.querySelector(".pano-overlay");
  panoOverlay.addEventListener("click", () => {
    panoOverlay.classList.add("pano-overlay-hidden");
  });

  // Load the krpano script, then create the panoramas.
  const krpanoScript = document.createElement("script");
  krpanoScript.setAttribute("src", "/tours/krpano.js");
  krpanoScript.setAttribute("type", "text/javascript");
  document.body.appendChild(krpanoScript);

  krpanoScript.addEventListener("load", () => {
    const coverPano = document.getElementById("pano-cover");

    embedpano({
      xml: `/tours/${coverPano.dataset.panoFolder}/pano.xml`,
      target: coverPano.id,
    });

    embedpano({
      xml: "/tours/solaris/tour.xml",
      target: "pano-solaris",
    });
    embedpano({
      xml: "/tours/vertigo/tour.xml",
      target: "pano-vertigo",
    });

    let toursPagePosition;
    const showModalToursTl = gsap
      .timeline({ paused: true })
      .fromTo(
        ".modal-tours",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2 },
      );

    const showModalTours = (project) => {
      toursPagePosition = scrollController.capturePosition();
      tourModalActive = true;
      document
        .querySelectorAll(".modal-pano")
        .forEach((panoElement) => panoElement.classList.add("hidden"));
      document.querySelector(`#pano-${project}`).classList.remove("hidden");
      showModalToursTl.restart();
    };

    const hideModalTours = () => {
      tourModalActive = false;
      gsap.to(".modal-tours", {
        autoAlpha: 0,
        duration: 0.2,
        onComplete: () => {
          scrollController.restorePosition(toursPagePosition);
        },
      });
    };

    const toursProjects = document.querySelector(".tours-proj");
    const closeButton = document.querySelector(".modal-tours .modal-close");
    let tourModalActive = false;

    toursProjects.addEventListener("click", (event) => {
      const projectElement = event.target.closest(".tour-item");
      if (!projectElement) return;
      showModalTours(projectElement.dataset.project);
    });

    closeButton.addEventListener("click", hideModalTours);

    window.addEventListener("keydown", (event) => {
      if (tourModalActive && event.key === "Escape") hideModalTours();
    });
  });
}

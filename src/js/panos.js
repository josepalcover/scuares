import { gsap } from "./gsap.js";

const PROJECT_TOURS = {
  solaris: {
    label: "Solaris",
    target: "pano-solaris",
    xml: "/tours/solaris/tour.xml",
  },
  vertigo: {
    label: "Vertigo",
    target: "pano-vertigo",
    xml: "/tours/vertigo/tour.xml",
  },
};

export function panosInit(scrollController) {
  // Hide the cover panorama overlay on click.
  const panoOverlay = document.querySelector(".pano-overlay");
  panoOverlay?.addEventListener("click", () => {
    panoOverlay.classList.add("pano-overlay-hidden");
  });

  // Load krpano near the tours section. The cover is the only panorama created
  // at this point; project panoramas are created on their first explicit open.
  const krpanoScript = document.createElement("script");
  krpanoScript.setAttribute("src", "/tours/krpano.js");
  krpanoScript.setAttribute("type", "text/javascript");
  document.body.appendChild(krpanoScript);

  krpanoScript.addEventListener("load", () => {
    const coverPano = document.getElementById("pano-cover");
    const modal = document.querySelector(".modal-tours");
    const toursProjects = document.querySelector(".tours-proj");
    const closeButton = modal?.querySelector(".modal-close");

    if (coverPano?.dataset.panoFolder) {
      embedpano({
        xml: `/tours/${coverPano.dataset.panoFolder}/pano.xml`,
        target: coverPano.id,
      });
    }

    if (!modal || !toursProjects || !closeButton) return;

    const initializedProjects = new Set();
    let toursPagePosition;
    let tourModalActive = false;
    let opener;

    const initializeProject = (project) => {
      const tour = PROJECT_TOURS[project];
      if (!tour || initializedProjects.has(project)) return;

      embedpano({ xml: tour.xml, target: tour.target });
      initializedProjects.add(project);
    };

    const showModalTours = (project) => {
      const tour = PROJECT_TOURS[project];
      if (!tour) return;

      toursPagePosition = scrollController.capturePosition();
      opener = document.activeElement;
      tourModalActive = true;
      modal
        .querySelectorAll(".modal-pano")
        .forEach((panoElement) => panoElement.classList.add("hidden"));
      document.getElementById(tour.target)?.classList.remove("hidden");
      modal.hidden = false;
      modal.setAttribute("aria-label", `${tour.label} virtual tour`);
      initializeProject(project);
      gsap.fromTo(
        modal,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2, overwrite: true },
      );
      closeButton.focus({ preventScroll: true });
    };

    const hideModalTours = () => {
      if (!tourModalActive) return;

      tourModalActive = false;
      gsap.to(modal, {
        autoAlpha: 0,
        duration: 0.2,
        overwrite: true,
        onComplete: () => {
          modal.hidden = true;
          scrollController.restorePosition(toursPagePosition);
          if (opener?.isConnected) opener.focus({ preventScroll: true });
          opener = undefined;
        },
      });
    };

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

import { gsap } from "./gsap.js";
import { createModalFocusManager } from "./modalFocus.js";

const KRPANO_SCRIPT_SELECTOR = "script[data-krpano-loader]";
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

const initializedProjects = new Set();
const initializingProjects = new Map();
const initializedTourContainers = new WeakSet();
let coverInitialization;
let coverInitialized = false;
let krpanoPromise;

function getEmbedPano() {
  return typeof window.embedpano === "function" ? window.embedpano : undefined;
}

function loadKrpano() {
  const embedPano = getEmbedPano();
  if (embedPano) return Promise.resolve(embedPano);
  if (krpanoPromise) return krpanoPromise;

  krpanoPromise = new Promise((resolve, reject) => {
    let script = document.querySelector(KRPANO_SCRIPT_SELECTOR);
    const isNewScript = !script;

    if (!script) {
      script = document.createElement("script");
      script.src = "/tours/krpano.js";
      script.type = "text/javascript";
      script.dataset.krpanoLoader = "";
    }

    const cleanup = () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };

    const fail = (error) => {
      cleanup();
      script.remove();
      reject(error);
    };

    const handleLoad = () => {
      const loadedEmbedPano = getEmbedPano();
      if (!loadedEmbedPano) {
        fail(new Error("krpano loaded without exposing embedpano()."));
        return;
      }

      cleanup();
      resolve(loadedEmbedPano);
    };

    const handleError = () => {
      fail(new Error("Could not load /tours/krpano.js."));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (isNewScript) document.body.appendChild(script);
  }).catch((error) => {
    krpanoPromise = undefined;
    throw error;
  });

  return krpanoPromise;
}

export function panosInit() {
  const coverPano = document.getElementById("pano-cover");
  if (
    coverInitialized ||
    coverInitialization ||
    !coverPano?.dataset.panoFolder
  ) {
    return coverInitialization;
  }

  coverInitialization = loadKrpano()
    .then((embedPano) => {
      if (coverInitialized) return;

      embedPano({
        xml: `/tours/${coverPano.dataset.panoFolder}/pano.xml`,
        target: coverPano.id,
      });
      coverInitialized = true;
    })
    .catch((error) => {
      console.error("Could not initialize the cover panorama.", error);
    })
    .finally(() => {
      coverInitialization = undefined;
    });

  return coverInitialization;
}

export function tourModalsInit(scrollController) {
  const modal = document.querySelector(".modal-tours");
  const toursProjects = document.querySelector(".tours-proj");
  const closeButton = modal?.querySelector(".modal-close");
  const panoOverlay = document.querySelector(".pano-overlay");

  if (
    !modal ||
    !toursProjects ||
    !closeButton ||
    initializedTourContainers.has(toursProjects)
  ) {
    return;
  }

  initializedTourContainers.add(toursProjects);
  panoOverlay?.addEventListener("click", () => {
    panoOverlay.classList.add("pano-overlay-hidden");
  });

  let activeProject;
  let tourModalActive = false;
  let toursPagePosition;

  const hideModalTours = () => {
    if (!tourModalActive) return;

    activeProject = undefined;
    tourModalActive = false;
    gsap.to(modal, {
      autoAlpha: 0,
      duration: 0.2,
      overwrite: true,
      onComplete: () => {
        if (tourModalActive) return;

        modal.hidden = true;
        scrollController.restorePosition(toursPagePosition);
        focusManager.deactivate();
      },
    });
  };

  const focusManager = createModalFocusManager(modal, {
    initialFocus: () => closeButton,
    onEscape: hideModalTours,
  });

  const initializeProject = (project) => {
    const tour = PROJECT_TOURS[project];
    if (!tour || initializedProjects.has(project)) return Promise.resolve();
    if (initializingProjects.has(project)) {
      return initializingProjects.get(project);
    }

    const initialization = loadKrpano()
      .then((embedPano) => {
        if (
          !tourModalActive ||
          activeProject !== project ||
          initializedProjects.has(project)
        ) {
          return;
        }

        embedPano({ xml: tour.xml, target: tour.target });
        initializedProjects.add(project);
      })
      .catch((error) => {
        console.error(`Could not initialize the ${tour.label} tour.`, error);
      })
      .finally(() => {
        initializingProjects.delete(project);
      });

    initializingProjects.set(project, initialization);
    return initialization;
  };

  const showModalTours = (project, opener) => {
    const tour = PROJECT_TOURS[project];
    if (!tour) return;

    toursPagePosition = scrollController.capturePosition();
    activeProject = project;
    tourModalActive = true;
    modal
      .querySelectorAll(".modal-pano")
      .forEach((panoElement) => panoElement.classList.add("hidden"));
    document.getElementById(tour.target)?.classList.remove("hidden");
    modal.hidden = false;
    modal.setAttribute("aria-label", `${tour.label} virtual tour`);
    gsap.fromTo(
      modal,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.2, overwrite: true },
    );
    focusManager.activate({ opener });
    void initializeProject(project);
  };

  toursProjects.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const projectElement = target.closest(".tour-item");
    if (!projectElement) return;

    const opener =
      target.closest(".btn-play") ??
      projectElement.querySelector(".btn-play") ??
      projectElement;
    showModalTours(projectElement.dataset.project, opener);
  });

  closeButton.addEventListener("click", hideModalTours);
}

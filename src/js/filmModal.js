import { createModalFocusManager } from "./modalFocus.js";

export function filmModalInit(scrollController) {
  const films = document.querySelector(".films-proj");
  const modal = document.querySelector(".modal-film");
  const playerHost = modal?.querySelector("[data-film-player]");
  const title = modal?.querySelector(".modal-title");
  const description = modal?.querySelector(".modal-description");
  const closeButton = modal?.querySelector(".modal-close");

  if (
    !films ||
    !modal ||
    !playerHost ||
    !title ||
    !description ||
    !closeButton
  ) {
    return;
  }

  const createPlayer = (project) => {
    if (!project.dataset.src) return;

    const iframe = document.createElement("iframe");
    iframe.className = "modal-iframe";
    iframe.src = project.dataset.src;
    iframe.title = `${project.dataset.title} film`;
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;
    return iframe;
  };

  let opener;
  let currentPlayer;
  let filmsPagePosition;

  const destroyPlayer = () => {
    if (!currentPlayer) return;

    currentPlayer.contentWindow?.postMessage(
      JSON.stringify({ method: "pause" }),
      "https://player.vimeo.com",
    );
    currentPlayer.remove();
    currentPlayer = undefined;
  };

  const focusManager = createModalFocusManager(modal, {
    initialFocus: () => closeButton,
    onEscape: () => hideModal(),
  });

  const showModal = (project, trigger) => {
    destroyPlayer();
    const player = createPlayer(project);
    if (!player) return;

    opener = trigger;
    filmsPagePosition = scrollController.capturePosition();
    title.textContent = project.dataset.title;
    description.innerHTML = project.dataset.description.replaceAll(
      "(br)",
      "<br>",
    );
    currentPlayer = player;
    playerHost.replaceChildren(player);
    modal.hidden = false;
    focusManager.activate({ opener });
  };

  const hideModal = () => {
    if (modal.hidden) return;

    destroyPlayer();
    modal.hidden = true;
    scrollController.restorePosition(filmsPagePosition);
    focusManager.deactivate();
    opener = undefined;
  };

  films.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const filmClicked = target.closest(".film-item");
    const trigger =
      target.closest(".btn-play") ??
      filmClicked?.querySelector(".btn-play") ??
      filmClicked;

    if (filmClicked) showModal(filmClicked, trigger);
  });

  closeButton.addEventListener("click", hideModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) hideModal();
  });
}

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

  const destroyPlayer = () => {
    if (!currentPlayer) return;

    currentPlayer.contentWindow?.postMessage(
      JSON.stringify({ method: "pause" }),
      "https://player.vimeo.com",
    );
    currentPlayer.remove();
    currentPlayer = undefined;
  };

  const showModal = (project) => {
    destroyPlayer();
    const player = createPlayer(project);
    if (!player) return;

    opener = document.activeElement;
    title.textContent = project.dataset.title;
    description.innerHTML = project.dataset.description.replaceAll(
      "(br)",
      "<br>",
    );
    currentPlayer = player;
    playerHost.replaceChildren(player);
    modal.hidden = false;
  };

  const hideModal = () => {
    destroyPlayer();
    modal.hidden = true;
    scrollController.scrollTo(films, {
      duration: 0,
      onComplete: () => scrollController.syncIndex(),
    });
    opener?.focus();
  };

  films.addEventListener("click", (event) => {
    const filmClicked = event.target.closest(".film-item");
    if (filmClicked) showModal(filmClicked);
  });

  closeButton.addEventListener("click", hideModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) hideModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) hideModal();
  });
}

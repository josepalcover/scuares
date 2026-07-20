import { state } from "./state.js";

export function filmModalInit() {
  const films = document.querySelector(".films-proj");
  const modal = document.querySelector(".modal-film");
  const playerHost = modal?.querySelector("[data-film-player]");
  const playerCache = document.querySelector(".film-player-cache");
  const title = modal?.querySelector(".modal-title");
  const description = modal?.querySelector(".modal-description");
  const closeButton = modal?.querySelector(".modal-close");

  if (
    !films ||
    !modal ||
    !playerHost ||
    !playerCache ||
    !title ||
    !description ||
    !closeButton
  ) {
    return;
  }

  const players = new Map();

  films.querySelectorAll(".film-item").forEach((project) => {
    const iframe = document.createElement("iframe");
    iframe.className = "modal-iframe";
    iframe.src = project.dataset.src;
    iframe.title = `${project.dataset.title} film`;
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.loading = "eager";
    playerCache.append(iframe);
    players.set(project, iframe);
  });

  let opener;
  let currentPlayer;

  const showModal = (project) => {
    const player = players.get(project);
    if (!player) return;

    opener = document.activeElement;
    currentPlayer = player;
    playerHost.append(player);
    title.textContent = project.dataset.title;
    description.innerHTML = project.dataset.description.replaceAll(
      "(br)",
      "<br>",
    );
    modal.hidden = false;
  };

  const hideModal = () => {
    currentPlayer?.contentWindow?.postMessage(
      JSON.stringify({ method: "pause" }),
      "https://player.vimeo.com",
    );
    if (currentPlayer) playerCache.append(currentPlayer);
    currentPlayer = undefined;
    modal.hidden = true;
    films.scrollIntoView({ block: "start" });
    state.index = Math.floor(window.scrollY / window.innerHeight);
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

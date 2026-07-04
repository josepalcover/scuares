gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import { state } from "./state.js";
export function filmModalInit() {
  // manually load vimeo script (insted of in the header to speed up page load)
  let vimeoScript = document.createElement("script");
  vimeoScript.setAttribute("src", "https://player.vimeo.com/api/player.js");
  vimeoScript.setAttribute("type", "text/javascript");
  document.body.appendChild(vimeoScript);

  // when script is loaded we create the modals
  vimeoScript.addEventListener("load", () => {
    // generate film modals based on the attributes
    // saved in the film-item elements
    const projFilms = gsap.utils.toArray(".film-item");

    projFilms.forEach((project) => {
      const projectName = project.dataset.name;
      const projectSrc = project.dataset.src;
      const projectTitle = project.dataset.title;
      const projectDescription = project.dataset.description.replaceAll(
        "(br)",
        "<br>"
      );
      const modalHtml = `
      <div class="modal-film modal-${projectName}">
        <div class="modal-container">
          <div class="modal-video">
            <iframe
              class="modal-iframe"
              src="${projectSrc}"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        
               
          <div class="modal-text">
            <h4 class="modal-title header-main">${projectTitle}</h4>
            <p class="modal-description text-1">${projectDescription}</p>
          </div>
        </div>
        <div class="modal-close">
          <div class="line-close line-close1"></div>
          <div class="line-close line-close2"></div>
        </div>
      </div>`;

      // inseret the HTML
      document
        .querySelector(".film-modals")
        .insertAdjacentHTML("beforebegin", modalHtml);
    }); // end of forEach loop

    //SHOW / HIDE MODALS
    let currentModal;
    let currentPlayer;

    const showModal = (projectName) => {
      currentModal = `.modal-${projectName}`;
      const currentIframe = document.querySelector(
        `${currentModal} .modal-iframe`
      );

      currentPlayer = new Vimeo.Player(currentIframe);

      gsap
        .timeline()
        .fromTo(
          `${currentModal}`,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.2,
          }
        )
        .from(
          `${currentModal} .modal-text`,
          { xPercent: 30, opacity: 0, duration: 0.2 },
          "<"
        )
        .from(`${currentModal} .modal-iframe`, {
          xPercent: -30,
          opacity: 0,
          duration: 0.2,
        });
    };

    const hideModal = () => {
      currentPlayer.pause();
      gsap
        .timeline()
        .to(window, {
          duration: 0,
          scrollTo: "#films-proj",
          // reset the state index to the one corresponding to films
          onComplete: () => {
            state.index = Math.floor(window.scrollY / innerHeight);
          },
        }) //scroll back to films
        .to(`${currentModal}`, { autoAlpha: 0, duration: 0.2 });
    };

    const films = document.querySelector(".films-proj");
    films.addEventListener("click", (e) => {
      // event delegation
      const filmClicked = e.target.closest(".film-item");
      if (!filmClicked) return;
      // pass the clicked film to showModal
      showModal(filmClicked.dataset.name);
    });

    const modalsFilms = document.querySelectorAll(".modal-film");
    modalsFilms.forEach((modal) => {
      modal.addEventListener("click", () => {
        hideModal();
      });
    });
  });
}

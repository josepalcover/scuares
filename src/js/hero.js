const initializedHeroes = new WeakSet();

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getInterval(hero) {
  const interval = Number.parseInt(hero.dataset.heroInterval, 10);
  return Number.isFinite(interval) && interval > 0 ? interval : 4000;
}

function getLogoTheme(theme) {
  return theme === "dark" ? "dark" : "light";
}

function getSlides(template, imgFormat) {
  return [...template.content.querySelectorAll("img[data-src]")]
    .map((img) => {
      const name = img.dataset.src?.trim();
      if (!name) return null;

      return {
        name,
        src: `/images/${name}.${imgFormat}`,
        alt: img.getAttribute("alt") ?? "",
        logoTheme: getLogoTheme(img.dataset.logo),
      };
    })
    .filter(Boolean);
}

function preload(slide) {
  if (!slide.loadPromise) {
    slide.loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      slide.image = img;

      img.onload = async () => {
        if (img.decode) {
          await img.decode().catch(() => {});
        }
        resolve();
      };

      img.onerror = () => {
        reject(new Error(`Could not load hero image: ${slide.src}`));
      };

      img.src = slide.src;
    });
  }

  return slide.loadPromise;
}

function applySlide(currentImage, logo, slide) {
  currentImage.src = slide.src;
  currentImage.alt = slide.alt;

  if (logo) {
    logo.dataset.theme = slide.logoTheme;
  }
}

async function runSequence(currentImage, logo, slides, interval) {
  let currentIndex = 0;

  try {
    await preload(slides[currentIndex]);
  } catch (error) {
    console.warn(error);
    return;
  }

  applySlide(currentImage, logo, slides[currentIndex]);

  if (slides.length === 1) return;

  while (true) {
    const nextIndex = (currentIndex + 1) % slides.length;
    const nextSlide = slides[nextIndex];

    const results = await Promise.allSettled([
      delay(interval),
      preload(nextSlide),
    ]);

    if (results[1].status === "fulfilled") {
      applySlide(currentImage, logo, nextSlide);
    } else {
      console.warn(results[1].reason);
    }

    currentIndex = nextIndex;
  }
}

export function heroInit(imgFormat) {
  const heroes = document.querySelectorAll("[data-hero-sequence]");

  heroes.forEach((hero) => {
    if (initializedHeroes.has(hero)) return;

    const currentImage = hero.querySelector("[data-hero-current]");
    const template = hero.querySelector("template[data-hero-slides]");
    if (!currentImage || !template) return;

    const slides = getSlides(template, imgFormat);
    if (slides.length === 0) return;

    initializedHeroes.add(hero);

    const logo = hero.querySelector("[data-hero-logo]");
    const interval = getInterval(hero);

    runSequence(currentImage, logo, slides, interval);
  });
}

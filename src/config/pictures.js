export const PICTURE_FORMATS = ["avif", "webp"];
export const PICTURE_FALLBACK_FORMAT = "jpg";
export const PICTURE_WIDTHS = [640, 960, 1280, 1920, 2560, 3200, 3840];
// Match the previous hand-compressed image pipeline. Astro's `high` preset is
// quality 80, which roughly doubled transfers during long mobile scrolls.
export const PICTURE_QUALITY = 40;
export const GALLERY_SIZES = "auto, 100vw";
export const HERO_SIZES = "100vw";

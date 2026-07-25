const SINGLE_COLUMN_ASPECT = "(aspect-ratio <= 13/10)";
const SINGLE_COLUMN_WIDTH = "(width <= 800px)";
const SINGLE_COLUMN_HEIGHT = "(height <= 450px)";

const TWO_COLUMN_ASPECT = "(aspect-ratio > 13/10)";
const TWO_COLUMN_WIDTH = "(width > 800px)";
const TWO_COLUMN_HEIGHT = "(height > 450px)";

export const SINGLE_COLUMN_CONDITIONS = [
  SINGLE_COLUMN_ASPECT,
  SINGLE_COLUMN_WIDTH,
  SINGLE_COLUMN_HEIGHT,
];

export const SINGLE_COLUMN_QUERY = SINGLE_COLUMN_CONDITIONS.join(", ");
export const NARROW_OR_PORTRAIT_QUERY = [
  SINGLE_COLUMN_ASPECT,
  SINGLE_COLUMN_WIDTH,
].join(", ");
export const WIDE_LANDSCAPE_QUERY = [TWO_COLUMN_ASPECT, TWO_COLUMN_WIDTH].join(
  " and ",
);
export const FILM_MODAL_HIDE_TEXT_QUERY = [
  `${TWO_COLUMN_ASPECT} and (width <= 700px)`,
  `(600px < width <= 800px) and (height <= 650px)`,
  `(width <= 600px) and (height <= 500px)`,
].join(", ");

export const TWO_COLUMN_QUERY = [
  TWO_COLUMN_ASPECT,
  TWO_COLUMN_WIDTH,
  TWO_COLUMN_HEIGHT,
].join(" and ");

export const ULTRA_WIDE_ASPECT_RATIO = "3/1";
export const ULTRA_WIDE_QUERY = `${TWO_COLUMN_QUERY} and (aspect-ratio >= ${ULTRA_WIDE_ASPECT_RATIO})`;

export const SLIDES_QUERY = `${TWO_COLUMN_QUERY} and (aspect-ratio < ${ULTRA_WIDE_ASPECT_RATIO})`;

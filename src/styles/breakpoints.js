export const SINGLE_COLUMN_CONDITIONS = [
  "(max-aspect-ratio: 13/10)",
  "(max-width: 800px)",
  "(max-height: 450px)",
];

export const SINGLE_COLUMN_QUERY = SINGLE_COLUMN_CONDITIONS.join(", ");

export const ULTRA_WIDE_ASPECT_RATIO = "3/1";
export const ULTRA_WIDE_QUERY = `(min-aspect-ratio: ${ULTRA_WIDE_ASPECT_RATIO})`;

// Keep the inclusive boundaries used by the existing GSAP slide queries.
export const TWO_COLUMN_QUERY = SINGLE_COLUMN_CONDITIONS.map((condition) =>
  condition.replace("(max-", "(min-"),
).join(" and ");

export const SLIDES_QUERY = `${TWO_COLUMN_QUERY} and (max-aspect-ratio: ${ULTRA_WIDE_ASPECT_RATIO})`;

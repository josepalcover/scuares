export const SINGLE_COLUMN_CONDITIONS = [
  "(max-aspect-ratio: 13/10)",
  "(max-width: 800px)",
  "(max-height: 450px)",
];

export const SINGLE_COLUMN_QUERY = SINGLE_COLUMN_CONDITIONS.join(", ");

// Keep the inclusive boundaries used by the existing GSAP slide queries.
export const TWO_COLUMN_QUERY = SINGLE_COLUMN_CONDITIONS.map((condition) =>
  condition.replace("(max-", "(min-"),
).join(" and ");

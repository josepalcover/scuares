import {
  FILM_MODAL_HIDE_TEXT_QUERY,
  NARROW_OR_PORTRAIT_QUERY,
  SINGLE_COLUMN_QUERY,
  ULTRA_WIDE_QUERY,
  WIDE_LANDSCAPE_QUERY,
} from "./src/styles/breakpoints.js";

const customMediaQueries = {
  "(--single-column)": SINGLE_COLUMN_QUERY,
  "(--ultra-wide)": ULTRA_WIDE_QUERY,
  "(--narrow-or-portrait)": NARROW_OR_PORTRAIT_QUERY,
  "(--wide-landscape)": WIDE_LANDSCAPE_QUERY,
  "(--film-modal-hide-text)": FILM_MODAL_HIDE_TEXT_QUERY,
};

const breakpointMedia = {
  postcssPlugin: "breakpoint-media",
  AtRule: {
    media(atRule) {
      for (const [name, query] of Object.entries(customMediaQueries)) {
        atRule.params = atRule.params.replace(name, query);
      }
    },
  },
};

export default {
  plugins: [breakpointMedia],
};

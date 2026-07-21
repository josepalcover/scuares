import {
  SINGLE_COLUMN_QUERY,
  ULTRA_WIDE_QUERY,
} from "./src/styles/breakpoints.js";

const customMediaQueries = {
  "(--single-column)": SINGLE_COLUMN_QUERY,
  "(--ultra-wide)": ULTRA_WIDE_QUERY,
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

import { SINGLE_COLUMN_QUERY } from "./src/config/layout.js";

const singleColumnMedia = {
  postcssPlugin: "single-column-media",
  AtRule: {
    media(atRule) {
      atRule.params = atRule.params.replace(
        "(--single-column)",
        SINGLE_COLUMN_QUERY,
      );
    },
  },
};

export default {
  plugins: [singleColumnMedia],
};

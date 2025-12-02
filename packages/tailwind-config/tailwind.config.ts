import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config = {
  content: [],
  theme: {
    // colors: {},
    extend: {},
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".font-sensitive": {
          "font-feature-settings": "'case' on",
        },
      });
    }),
  ],
} satisfies Config;

export default config;

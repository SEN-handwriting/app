/** @type {import("prettier").config} */
const config = {
  useTabs: false,
  tabWidth: 2,
  printWidth: 80,
  semi: true,
  singleQuote: false,
  jsxSingleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
  arrowParens: "avoid",

  plugins: ["prettier-plugin-tailwindcss"],
  tailwindFunctions: ["tv", "cva", "clsx", "cx", "cn"],
};

export default config;

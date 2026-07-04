/** @type {import("prettier").Config} */
export default {
  endOfLine: "lf",
  plugins: ["prettier-plugin-astro"],
  printWidth: 88,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};

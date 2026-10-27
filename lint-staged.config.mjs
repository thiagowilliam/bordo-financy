const quote = (files) => files.map((file) => `"${file}"`).join(" ");

const config = {
  "apps/web/**/*.{ts,tsx,js,mjs}": (files) => [
    `pnpm --filter @bordo/web exec eslint --fix ${quote(files)}`,
    `prettier --write ${quote(files)}`,
  ],
  "!(apps/web)/**/*.{ts,tsx,js,mjs}": (files) => [`prettier --write ${quote(files)}`],
  "*.{json,md,css,yml,yaml}": ["prettier --write"],
};

export default config;

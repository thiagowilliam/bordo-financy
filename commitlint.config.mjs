const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [
        "trips",
        "expenses",
        "base-costs",
        "categories",
        "auth",
        "ui",
        "design-system",
        "config",
        "deps",
        "mocks",
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 72],
  },
};

export default config;

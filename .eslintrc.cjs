module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    },
    project: null
  },
  plugins: ["@typescript-eslint", "react", "react-hooks", "jsx-a11y"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:@typescript-eslint/strict",
    "prettier"
  ],
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    // Prefer TS-aware unused vars rule
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "ignoreRestSiblings": true }
    ],

    // Enforce exhaustive deps for hooks
    "react-hooks/exhaustive-deps": "warn",

    // React specific improvements
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",

    // Ensure consistent accessible code
    "jsx-a11y/anchor-is-valid": "warn",

    // Leverage TS strictness for implicit any
    "@typescript-eslint/no-explicit-any": "warn"
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    ".eslintrc.cjs"
  ]
};

import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

/** @type {import('eslint').Linter.Config[]} */
export default [
  eslintPluginPrettierRecommended, // Ensure Prettier is applied consistently
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".vscode/**",
      "dist/**",
      "build/**",
    ],
  },
  {
    files: ["src/**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "react/react-in-jsx-scope": "off", // Explicitly turning off this rule
      "prettier/prettier": "error", // Ensure Prettier errors are flagged
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];

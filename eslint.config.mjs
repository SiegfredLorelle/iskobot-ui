import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Add Prettier rules first for consistency
  eslintPluginPrettierRecommended,

  // This rule configuration applies to JS/TS files
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // Adding recommended configurations from various plugins
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,

  // Add custom Prettier configurations to ensure no conflicts
  {
    rules: {
      "react/react-in-jsx-scope": "off", // Explicitly turning off this rule
      "prettier/prettier": "error", // Make sure Prettier runs as an error if issues are found
    },
  },
];

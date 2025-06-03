// frontend/eslint.config.js
import globals from "globals"; // Stelle sicher, dass dieser Import da ist
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react': eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
    },
    languageOptions: {
      parserOptions: {
        project: true,
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser, // Stellt fetch, window, navigator etc. bereit
        ...globals.es2021,  // Für moderne JavaScript Features
        window: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        // ggf. ...globals.node für Node.js spezifische Globals, falls nötig (hier eher nicht für Komponenten)
      }
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // ... deine Regeln ...
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }], // Auch ungenutzte Variablen ignorieren, die mit _ beginnen
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-misused-promises': 'off', // Regel deaktiviert
    },
  },
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/', 'node_modules/', '.vite/', 'coverage/', 'eslint.config.js', 'vite.config.ts'],
  }
);
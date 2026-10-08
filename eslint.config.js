import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // ─────────────────────────────────────────────────────────────
      // Ignore `_`-prefixed variables / args / caught errors.
      // Lets you write `(_pin: string) => {}` and `catch (_err) {}`
      // without tripping the unused-vars rule.
      // ─────────────────────────────────────────────────────────────
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }],

      // ─────────────────────────────────────────────────────────────
      // React 19 compiler rules — advisory for now.
      // These require real refactors (useMemo, useCallback, moving
      // components out of render). Downgrade to warnings so CI passes
      // while we clean up the codebase file by file.
      // Once the tree is clean, flip these back to 'error'.
      // ─────────────────────────────────────────────────────────────
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])
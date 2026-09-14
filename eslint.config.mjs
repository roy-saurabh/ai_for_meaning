import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'react/no-danger': 'error',
    },
  },
  {
    // The only sanctioned dangerouslySetInnerHTML: escaped JSON-LD and the static, nonce-carrying ThemeScript.
    files: ['components/seo/JsonLd.tsx', 'components/layout/ThemeScript.tsx'],
    rules: { 'react/no-danger': 'off' },
  },
  {
    // Developer scripts print to the terminal by design.
    files: ['scripts/**', 'tests/**'],
    rules: { 'no-console': 'off' },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'docs/reference/**',
    'public/sw.js',
    'playwright-report/**',
    'test-results/**',
  ]),
]);

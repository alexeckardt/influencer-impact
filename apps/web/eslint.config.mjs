import js from '@eslint/js';
import next from 'eslint-config-next';

const config = [
  {
    ignores: [
      '.next/**',
      '.open-next/**',
      'node_modules/**',
      'out/**',
      'dist/**',
    ],
  },
  js.configs.recommended,
  ...next,
  {
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react/no-unescaped-entities': 'off',
    },
  },
];

export default config;

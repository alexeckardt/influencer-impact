import js from '@eslint/js';
import next from 'eslint-config-next';

const config = [
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

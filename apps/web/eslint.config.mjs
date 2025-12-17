import type { ESLintConfig } from 'eslint';

const config: ESLintConfig = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
  },
};

export default config;

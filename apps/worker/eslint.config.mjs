import type { ESLintConfig } from 'eslint';

const config: ESLintConfig = {
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off', // Allow console for worker logging
  },
};

export default config;

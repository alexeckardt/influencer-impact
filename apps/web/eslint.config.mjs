/** @type {import('eslint').Linter.Config} */
const config = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
  },
};

export default config;

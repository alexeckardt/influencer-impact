/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  outputFileTracingIncludes: {
    '/': ['./node_modules/**/*'],
  },
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  },
};

module.exports = nextConfig;

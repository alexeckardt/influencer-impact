/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Disable Turbopack for production builds to ensure standalone output works
  turbo: undefined,
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

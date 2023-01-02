/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['oaidalleapiprodscus.blob.core.windows.net', 'localhost'],
  },
};

module.exports = nextConfig;

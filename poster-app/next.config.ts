import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // @resvg/resvg-js uses native Node.js bindings — must not be bundled by webpack
  // This tells Next.js to load it directly from node_modules at runtime
  serverExternalPackages: ['@resvg/resvg-js'],

  // Allow images from any source in <img> tags (poster logos, QR codes are data URIs)
  images: {
    unoptimized: true, // poster images are generated server-side, not via next/image
  },
};

export default nextConfig;

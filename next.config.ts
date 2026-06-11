import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
  // Canonicalize the host: 301 www.tankfindr.com -> tankfindr.com so the two
  // hostnames don't serve duplicate content (both previously returned 200).
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.tankfindr.com' }],
        destination: 'https://tankfindr.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

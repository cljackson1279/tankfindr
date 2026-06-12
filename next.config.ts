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
      // Old flat state slugs -> new /septic-records/[state] hierarchy (301).
      // Florida had a real page (preserve its equity); CA/VA were 404s.
      { source: '/florida-septic-tank-locator', destination: '/septic-records/florida', permanent: true },
      { source: '/california-septic-tank-locator', destination: '/septic-records/california', permanent: true },
      { source: '/virginia-septic-tank-locator', destination: '/septic-records/virginia', permanent: true },
    ];
  },
};

export default nextConfig;

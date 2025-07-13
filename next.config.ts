
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    GOOGLE_SCRIPT_API_ENDPOINT: 'https://script.google.com/macros/s/AKfycbwnKe6TLGG51VopTBh2rKaS9y6ZMehxl9mPvnuhUTLcYO5hx7cMkhI54a9W-nNFdTDwEQ/exec',
    GOOGLE_SHEETS_ID: '1z_6CN-5qHWvnphs8H3fNSldQVQHc9X6qxutyW66MwUw',
    GOOGLE_SHEET_NAME: 'Sheet1',
    GOOGLE_SHEET_NAME_SHEET2: 'Sheet2',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

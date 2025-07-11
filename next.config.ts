
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    GOOGLE_SCRIPT_API_ENDPOINT: 'https://script.google.com/macros/s/AKfycbwTnL1RGjCHKsMsrRyw0bNRBfReAKeut0uu6gdszOLXZ6SAJbG2LYl-UYPW-41caxmPuA/exec',
    GOOGLE_SHEETS_ID: '1z_6CN-5qHWvnphs8H3fNSldQVQHc9X6qxutyW66MwUw',
    GOOGLE_SHEET_NAME: 'Sheet1',
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

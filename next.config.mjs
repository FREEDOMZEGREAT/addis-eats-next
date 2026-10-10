/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [35, 75],
    localPatterns: [
      {
        pathname: "/dishes/**",
        search: "?v=2",
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Đóng gói gọn cho Docker: chỉ mang theo phần cần để chạy (xem Dockerfile)
  output: 'standalone',
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

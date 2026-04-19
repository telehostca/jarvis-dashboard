/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone", // for Docker deploy on Coolify
  env: {
    NEXT_PUBLIC_JARVIS_API: process.env.JARVIS_API_URL || "https://jarvis.telehost.net",
  },
};

export default nextConfig;

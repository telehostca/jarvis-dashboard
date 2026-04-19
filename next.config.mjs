/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Intentionally NOT using "output: standalone" — it causes
  // "<Html> should not be imported" errors on Alpine in Next 15.
  // Use normal build + "next start" in Docker instead.
  env: {
    NEXT_PUBLIC_JARVIS_API: process.env.JARVIS_API_URL || "https://jarvis.telehost.net",
  },
};

export default nextConfig;

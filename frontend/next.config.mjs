/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const rawBackendUrl =
      process.env.BACKEND_URL ||
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    let target = rawBackendUrl.trim();

    // If protocol is missing, determine protocol
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      if (target.includes(".onrender.com")) {
        target = `https://${target}`;
      } else {
        target = `http://${target}`;
      }
    }

    // Strip trailing /api/v1 or / if present
    target = target.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");

    return [
      {
        source: "/api/v1/:path*",
        destination: `${target}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;



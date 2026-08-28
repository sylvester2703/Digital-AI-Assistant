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

    // If it is a Render service name without onrender.com and not localhost
    if (
      !target.includes(".onrender.com") &&
      !target.includes("localhost") &&
      !target.includes("127.0.0.1") &&
      !target.startsWith("http://") &&
      !target.startsWith("https://")
    ) {
      // Remove any internal port like :10000
      const hostOnly = target.split(":")[0];
      target = `https://${hostOnly}.onrender.com`;
    } else if (!target.startsWith("http://") && !target.startsWith("https://")) {
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




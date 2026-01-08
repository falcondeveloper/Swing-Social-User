import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
        domains: ["truecontractingsolutions.app"],
    },
    allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
};

export default nextConfig;

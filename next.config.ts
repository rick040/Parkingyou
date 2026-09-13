import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * Stock photography carried over from the rebranding prototype.
     *
     * Temporary. Phase 2 moves media to EU S3-compatible object storage, which
     * both replaces these with real ParkingYou photography and removes a
     * United States image host from every page view. Tracked in the content
     * files as {{TODO-NL: echte foto}}.
     */
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

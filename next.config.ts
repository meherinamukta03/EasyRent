import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Equipment images are uploaded through a Server Action as multipart
      // form data. The 1MB default rejects typical photos with React error
      // #441; leave room for the form fields and multipart overhead.
      bodySizeLimit: "10mb",
    },
  },
}

export default nextConfig

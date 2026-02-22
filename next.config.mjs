/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "onnxruntime-node",
    "sharp",
    "@huggingface/transformers",
  ],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/videos",
        has: [
          {
            type: "host",
            value: "esg.video",
          },
        ],
        permanent: false,
      },
      {
        source: "/",
        destination: "/videos",
        has: [
          {
            type: "host",
            value: "www.esg.video",
          },
        ],
        permanent: false,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude native ONNX and transformers modules from the server bundle
      config.externals = config.externals || [];
      config.externals.push({
        "onnxruntime-node": "commonjs onnxruntime-node",
        "@huggingface/transformers": "commonjs @huggingface/transformers",
      });
    }
    // Handle WASM files for client-side @huggingface/transformers
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },
};
export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "onnxruntime-node",
    "sharp",
    "@huggingface/transformers",
  ],
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

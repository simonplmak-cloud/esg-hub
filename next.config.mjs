/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "onnxruntime-node",
    "onnxruntime-web",
    "onnxruntime-common",
    "@huggingface/transformers",
    "sharp",
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude native modules from the server bundle
      config.externals = config.externals || [];
      config.externals.push({
        "onnxruntime-node": "commonjs onnxruntime-node",
      });
    }
    return config;
  },
};
export default nextConfig;

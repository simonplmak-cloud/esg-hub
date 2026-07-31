import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const isProd = process.env.VERCEL_ENV === "production";

const SECURITY_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline needed for Next.js; unsafe-eval for client scripts
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://esg-hub.ascent.partners https://api.perplexity.ai https://api.brave.com https://api.deepseek.com",
      "frame-src 'self' https://www.youtube.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
];

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon\\.ico|images).*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },
  outputFileTracingExcludes: {
    "*": [
      "node_modules/onnxruntime-node/**",
      "node_modules/@huggingface/transformers/**",
      "node_modules/sharp/**",
      "node_modules/@img/**",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
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
export default withNextIntl(nextConfig);

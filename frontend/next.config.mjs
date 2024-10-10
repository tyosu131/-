/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        poll: 500, // ポーリング間隔を短くする
        aggregateTimeout: 300, // 変更後にビルドを待つ時間
        ignored: /node_modules/, // node_modulesフォルダを無視
      };
    }
    return config;
  },
};

export default nextConfig;

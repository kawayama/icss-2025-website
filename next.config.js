/** @type {import('next').NextConfig} */

const repo = 'icss-2025-website'
const assetPrefix = process.env.NODE_ENV === 'production' ? `/${repo}` : ''
const basePath = process.env.NODE_ENV === 'production' ? `/${repo}` : ''

const nextConfig = {
  output: 'export',  // Static site出力を有効化
  assetPrefix: assetPrefix,  // GitHub Pagesのアセットパス設定
  basePath: basePath,  // GitHub Pagesのベースパス設定
  images: {
    unoptimized: true,  // 画像最適化を無効化（静的出力で必要）
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    return config;
  },
  // GitHub Pages向けにtrailing slashを無効化
  trailingSlash: false,
}

module.exports = nextConfig 
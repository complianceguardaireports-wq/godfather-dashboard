/** @type {import('next').NextConfig} */
const isGhPages = process.env.GITHUB_PAGES === 'true'
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGhPages ? '/godfather-dashboard' : '',
  assetPrefix: isGhPages ? '/godfather-dashboard/' : '',
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
}
module.exports = nextConfig

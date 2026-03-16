/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        styledComponents: true,
    },
    sassOptions: {
        implementation: 'sass-embedded',
    },
    reactStrictMode: false,
    distDir: 'dist',

    // ── Tomcat deployment settings ──────────────────────────────────────────
    // Uncomment these before running `npm run build` for production deployment:
    //   output: 'export',    // generates static HTML/JS/CSS into dist/
    //   basePath: '/next',   // app is served under yourdomain.com/next/
    //   trailingSlash: true,
    // ────────────────────────────────────────────────────────────────────────
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
    async rewrites() {
        return [
            {
                source: '/getting-started',
                destination: '/docs/getting-started',
            },
            {
                source: '/architecture/:path*',
                destination: '/docs/architecture/:path*',
            },
            {
                source: '/tutorials/:path*',
                destination: '/docs/tutorials/:path*',
            },
            {
                source: '/reference/:path*',
                destination: '/docs/reference/:path*',
            },
            {
                source: '/install',
                destination: '/docs/install',
            },
            {
                source: '/opentelemetry',
                destination: '/docs/opentelemetry',
            },
            {
                source: '/r2-setup',
                destination: '/docs/r2-setup',
            },
            {
                source: '/github-bot',
                destination: '/docs/github-bot',
            },
            {
                source: '/running-agent',
                destination: '/docs/running-agent',
            },
            {
                source: '/troubleshooting',
                destination: '/docs/troubleshooting',
            }
        ]
    },
}

module.exports = nextConfig

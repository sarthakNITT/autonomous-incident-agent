import createMDX from '@next/mdx'

const nextConfig = {
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    async rewrites() {
        return [
            {
                source: '/getting-started',
                destination: '/docs/getting-started',
            },
            {
                source: '/install',
                destination: '/docs/install',
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
                source: '/architecture',
                destination: '/docs/architecture',
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
                source: '/troubleshooting',
                destination: '/docs/troubleshooting',
            },
            {
                source: '/opentelemetry',
                destination: '/docs/opentelemetry',
            },
            {
                source: '/r2-setup',
                destination: '/docs/r2-setup',
            },
        ]
    },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)

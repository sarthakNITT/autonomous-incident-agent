# 🤖 Autonomous Incident Agent (AIA)

**AI-powered incident detection, root cause analysis, and automated fixes for your applications.**

[![Production Ready](https://img.shields.io/badge/production-ready-green.svg)](./QUICKSTART.md)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](./docker-compose.prod.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## 🌟 What is AIA?

AIA is an autonomous system that:

- 🔍 **Detects incidents** in real-time using OpenTelemetry
- 🧠 **Analyzes root causes** using AI (GPT-4)
- 🔧 **Generates fixes** with AI prompts and manual steps
- 📊 **Provides insights** through a modern dashboard
- 🔐 **Supports multi-tenancy** with per-project credentials

## 🚀 Quick Start

### For Users (Deploy as a Service)

Deploy AIA to monitor your applications:

```bash
git clone https://github.com/sarthakNITT/autonomous-incident-agent.git
cd autonomous-incident-agent

cp .env.production.template .env.production

./scripts/deploy-production.sh

open http://localhost:3006
```

**See [QUICKSTART.md](./QUICKSTART.md) for detailed deployment instructions.**

### For Contributors (Local Development)

Set up the development environment:

```bash
git clone https://github.com/sarthakNITT/autonomous-incident-agent.git
cd autonomous-incident-agent

bun install

cp .env.local.example .env.local

cd apps/state
npx prisma migrate dev
npx prisma generate
cd ../..

bun run dev

http://localhost:3006
```

## 📋 Prerequisites

### For Production Deployment:

- Docker and Docker Compose
- PostgreSQL database (or use included Docker Postgres)
- Cloudflare R2 account (for storage)
- You.com API key (or OpenAI-compatible API)
- Clerk account (for authentication)
- GitHub token (optional, for default)

### For Local Development:

- Bun runtime (v1.0+)
- PostgreSQL database
- Node.js 20+ (for some tools)
- Git

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  USER'S APPLICATION                      │
│        (Instrumented with OpenTelemetry)                │
└────────────────────┬────────────────────────────────────┘
                     │ Sends traces/logs
                     ▼
┌────────────────────────────────────────────────────────┐
│  AGENT (Port 4318) - OTel Receiver                      │
│  • Detects incidents from telemetry data               │
│  • Tags with project_id                                 │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│  ROUTER (Port 3001) - Incident Router                   │
│  • Fetches project credentials                          │
│  • Creates snapshots                                     │
│  • Triggers autopsy with project-specific credentials   │
└────────────────────┬───────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐
│  STATE (3003)    │    │  AUTOPSY (3002)      │
│  • PostgreSQL    │    │  • AI analysis       │
│  • Projects      │    │  • Root cause        │
│  • Incidents     │    │  • Fix generation    │
└──────────────────┘    └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │  R2 STORAGE          │
                        │  • Snapshots         │
                        │  • Autopsy results   │
                        │  • Patches & logs    │
                        └──────────────────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │  WEB (3006)          │
                        │  • Dashboard UI      │
                        │  • Project mgmt      │
                        │  • Incident view     │
                        └──────────────────────┘
```

## 🎯 Features

### Core Features

- ✅ **Real-time Incident Detection** - OpenTelemetry integration
- ✅ **AI-Powered Analysis** - Root cause identification using GPT-4
- ✅ **Automated Fix Suggestions** - AI-generated prompts and manual steps
- ✅ **Multi-Project Support** - Manage multiple applications
- ✅ **Credential Isolation** - Each project uses its own API keys
- ✅ **PDF Reports** - Generate incident reports on-demand
- ✅ **Modern Dashboard** - Beautiful UI with dark mode

### For Users

- 🔐 **Secure Authentication** - Clerk-powered auth
- 📊 **Incident Dashboard** - View all incidents with details
- 🤖 **AI Fix Prompts** - Copy-paste ready prompts for AI agents
- 📝 **Manual Steps** - Step-by-step fix instructions
- 📄 **PDF Export** - Download incident reports
- 🔔 **Real-time Updates** - See incidents as they happen

### For Developers

- 🐳 **Docker Support** - Easy deployment with Docker Compose
- 🏥 **Health Checks** - All services have health endpoints
- 📚 **Comprehensive Docs** - Detailed guides and API docs
- 🔧 **TypeScript** - Full type safety
- 🧪 **Testable** - Modular architecture

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Quick deployment guide
- **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - Detailed deployment instructions
- **[PROJECT_CREDENTIALS_INTEGRATION.md](./PROJECT_CREDENTIALS_INTEGRATION.md)** - How credentials work
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines

## 🔧 Configuration

### Environment Variables

#### Required for Production:

```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname

R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=autonomous-incidents

YOU_API_KEY=your_api_key

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

#### Optional:

```bash
GITHUB_TOKEN=ghp_your_token
AI_MODEL=gpt-4o
```

**See [.env.production.template](./.env.production.template) for complete configuration.**

### For Local Development:

Create `.env.local` with your development credentials:

```bash
cp .env.local.example .env.local
nano .env.local
```

## 🎓 How It Works

### 1. Instrument Your Application

Add OpenTelemetry to your application:

```typescript
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",
  }),
  serviceName: "my-app",
});

sdk.start();
```

### 2. Create a Project

Sign in to the dashboard and create a project:

- Name: Your application name
- Repository URL: GitHub repo URL
- GitHub Token: (optional) Your GitHub token
- OpenAI API Key: (optional) Your OpenAI key

### 3. Monitor Incidents

When an error occurs:

1. Agent detects the incident from telemetry
2. Router fetches your project credentials
3. Autopsy analyzes using your OpenAI key
4. Dashboard shows root cause, fix prompt, and manual steps
5. Download PDF report or view suggested fixes

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/autonomous-incident-agent.git
cd autonomous-incident-agent

bun install

cp .env.local.example .env.local
cd apps/state
npx prisma migrate dev
cd ../..
bun run dev
```

### Making Changes

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Test thoroughly
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style

- TypeScript for all code
- Prettier for formatting (runs on commit)
- ESLint for linting
- Follow existing patterns

**See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.**

## 📦 Project Structure

```
autonomous-incident-agent/
├── apps/
│   ├── agent/          # OTel receiver & incident detector
│   ├── router/         # Incident router & orchestrator
│   ├── autopsy/        # AI-powered root cause analysis
│   ├── state/          # State management & database
│   ├── web/            # Next.js dashboard
│   └── docs/           # Documentation site
├── packages/
│   ├── storage/        # R2 storage client
│   ├── types/          # Shared TypeScript types
│   └── ui/             # Shared UI components
├── shared/
│   └── config_loader/  # Configuration loader
├── scripts/
│   └── deploy-production.sh  # Deployment script
├── docker-compose.prod.yml   # Production Docker Compose
├── .env.production.template  # Environment template
└── docs/
    ├── QUICKSTART.md
    ├── PRODUCTION_DEPLOYMENT.md
    └── PROJECT_CREDENTIALS_INTEGRATION.md
```

## 🐳 Docker Deployment

### Quick Deploy

```bash
./scripts/deploy-production.sh
```

### Manual Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d

docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml down
```

## 🧪 Testing

```bash
bun test


cd apps/autopsy
bun test

bun test:e2e
```

## 📊 Monitoring

All services expose health check endpoints:

```bash
curl http://localhost:3003/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:4318/health
curl http://localhost:3006/
```

## 🔒 Security

- All credentials are encrypted at rest
- Per-project credential isolation
- Clerk-powered authentication
- HTTPS/TLS in production
- Rate limiting on public endpoints

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenTelemetry for observability
- Clerk for authentication
- Cloudflare R2 for storage
- You.com for AI capabilities

## 📞 Support

- **Documentation**: See [docs](./docs) folder
- **Issues**: [GitHub Issues](https://github.com/sarthakNITT/autonomous-incident-agent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sarthakNITT/autonomous-incident-agent/discussions)

## 🗺️ Roadmap

- [ ] Slack/Discord notifications
- [ ] GitHub PR auto-creation
- [ ] Custom detection rules
- [ ] Multi-cloud storage support
- [ ] Advanced analytics
- [ ] Team collaboration features

---

**Made with ❤️ by the AIA team**

**Status**: ✅ Production Ready | **Version**: 1.0.0

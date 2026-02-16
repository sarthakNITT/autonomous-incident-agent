# 🤖 Autonomous Incident Agent (AIA)

**AI-powered deployment monitoring and automated incident resolution for your applications.**

[![Production Ready](https://img.shields.io/badge/production-ready-green.svg)](./QUICKSTART.md)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](./docker-compose.prod.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## 🌟 What is AIA?

AIA is an autonomous incident resolution service that monitors your deployments and automatically fixes errors:

- 🚀 **Monitors Deployments** - Integrates with Vercel & GitHub Pages via webhooks
- 🔍 **Detects Failures** - Catches deployment errors in real-time
- 🧠 **Analyzes Root Causes** - AI-powered error analysis using GPT-4
- 🔧 **Generates Fixes** - Automatic PR creation or manual fix instructions
- 📊 **Beautiful Dashboard** - Modern UI to manage projects and view incidents

## 🚀 Quick Start

### For Users (Using AIA as a Service)

**No infrastructure setup needed!** Just:

1. **Sign up** at the AIA dashboard
2. **Create a project** - Enter your GitHub repo URL and token
3. **Configure webhook** - Add AIA's webhook to Vercel/GitHub Pages
4. **Done!** - AIA monitors your deployments automatically

#### Step-by-Step:

```bash
# 1. Visit the dashboard
open https://your-aia-instance.com

# 2. Create a project with:
#    - Project Name
#    - GitHub Repository URL
#    - GitHub Token (for private repos & PRs)
#    - Base Branch (auto-detected from your repo)
#    - Resolution Mode (Auto PR or Manual Fix)

# 3. Copy the webhook URL from dashboard and add to:
#    - Vercel: Settings → Git → Deploy Hooks
#    - GitHub Pages: Settings → Webhooks
```

**That's it!** No database setup, no API keys to manage, no storage configuration needed.

### For Developers (Self-Hosting AIA)

Deploy your own AIA instance:

```bash
git clone https://github.com/sarthakNITT/autonomous-incident-agent.git
cd autonomous-incident-agent

# Configure environment
cp .env.production.template .env.production
nano .env.production  # Add your credentials

# Deploy with Docker
./scripts/deploy-production.sh

# Access dashboard
open http://localhost:3006
```

**See [QUICKSTART.md](./QUICKSTART.md) for detailed self-hosting instructions.**

### For Contributors (Local Development)

```bash
git clone https://github.com/sarthakNITT/autonomous-incident-agent.git
cd autonomous-incident-agent

bun install
cp .env.local.example .env.local

# Setup database
cd apps/state
bunx prisma migrate dev
bunx prisma generate
cd ../..

# Start all services
bun run dev

# Dashboard: http://localhost:3006
```

## 📋 What Users Need

### As a Service User (Zero Infrastructure):

- ✅ GitHub account
- ✅ GitHub Personal Access Token (for private repos & PR creation)
- ✅ Vercel or GitHub Pages deployment

### As a Self-Hoster (Full Control):

- Docker & Docker Compose
- PostgreSQL database (Neon, Supabase, or self-hosted)
- Cloudflare R2 or S3-compatible storage
- AI API key (You.com, OpenAI, or compatible)
- Clerk account (for authentication)

## 🎯 Key Features

### 🚀 Deployment Monitoring

- **Webhook Integration** - Vercel & GitHub Pages support
- **Real-time Detection** - Instant failure notifications
- **Error Extraction** - Automatic log parsing and analysis

### 🤖 Intelligent Resolution

- **Auto PR Mode** - Automatically creates pull requests with fixes
- **Manual Mode** - Provides AI prompts and step-by-step instructions
- **Per-Project Settings** - Choose resolution mode for each project

### 📊 Smart Dashboard

- **Project Management** - Connect repos with one click
- **Branch Auto-Discovery** - Fetches real branches from GitHub
- **Incident Tracking** - View all deployment failures and fixes
- **Profile Management** - Update your account settings

### 🔐 Security & Privacy

- **Per-Project Credentials** - Each project uses its own GitHub token
- **Secure Authentication** - Clerk-powered user management
- **Encrypted Storage** - All credentials encrypted at rest

## 🎓 How It Works

### For Service Users:

```
1. CREATE PROJECT
   ↓
   User enters GitHub repo URL
   ↓
   AIA connects & fetches branches
   ↓
   User selects branch & resolution mode
   ↓
   Project created ✓

2. CONFIGURE WEBHOOK
   ↓
   Copy webhook URL from dashboard
   ↓
   Add to Vercel/GitHub Pages settings
   ↓
   Webhook active ✓

3. AUTOMATIC MONITORING
   ↓
   Deployment fails on Vercel/GitHub
   ↓
   Webhook triggers AIA
   ↓
   AIA analyzes error with AI
   ↓
   [Auto PR Mode] → Creates PR with fix
   [Manual Mode] → Shows fix in dashboard
   ↓
   Incident resolved ✓
```

### Example: Creating a Project

```typescript
// User fills the form:
{
  name: "My Website",
  repoUrl: "https://github.com/user/repo",
  githubToken: "ghp_...",  // Optional, for private repos
  baseBranch: "main",      // Auto-populated from GitHub
  resolutionMode: "auto"   // or "manual"
}

// AIA handles everything else:
// - Validates GitHub access
// - Fetches available branches
// - Stores encrypted credentials
// - Generates webhook URL
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│   VERCEL / GITHUB PAGES DEPLOYMENT      │
│         (User's Application)            │
└──────────────┬──────────────────────────┘
               │ Deployment fails
               │ Sends webhook
               ▼
┌──────────────────────────────────────────┐
│  WEBHOOK ENDPOINT (/api/webhooks/...)    │
│  • Receives failure notification         │
│  • Extracts error logs                   │
│  • Creates incident                      │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  AUTOPSY SERVICE (AI Analysis)           │
│  • Analyzes error with GPT-4             │
│  • Generates fix                         │
│  • Uses project's GitHub token           │
└──────────────┬───────────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌─────────────┐  ┌──────────────┐
│  AUTO PR    │  │  MANUAL FIX  │
│  • Create   │  │  • Show in   │
│    PR with  │  │    dashboard │
│    fix      │  │  • AI prompt │
└─────────────┘  └──────────────┘
```

## 📚 Documentation

### For Users:

- **[DEPLOYMENT_MONITORING.md](./DEPLOYMENT_MONITORING.md)** - Webhook setup guide
- **[QUICKSTART.md](./QUICKSTART.md)** - Getting started

### For Self-Hosters:

- **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - Self-hosting guide
- **[SECURITY.md](./SECURITY.md)** - Security best practices
- **[MONITORING.md](./MONITORING.md)** - System monitoring

### For Contributors:

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[PROJECT_CREDENTIALS_INTEGRATION.md](./PROJECT_CREDENTIALS_INTEGRATION.md)** - Credential system

## 🔧 Configuration (Self-Hosting Only)

Users of the service **don't need to configure these**. Only required for self-hosting:

```bash
# Database (Neon, Supabase, etc.)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Storage (Cloudflare R2, S3, etc.)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=autonomous-incidents

# AI Provider (You.com, OpenAI, etc.)
YOU_API_KEY=your_api_key

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

**See [.env.production.template](./.env.production.template) for complete configuration.**

## 🤝 Contributing

We welcome contributions! Here's how:

### Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/autonomous-incident-agent.git
cd autonomous-incident-agent

bun install
cp .env.local.example .env.local

# Setup database
cd apps/state
bunx prisma migrate dev
bunx prisma generate
cd ../..

# Start development
bun run dev
```

### Making Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly: `bun test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

**See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.**

## 📦 Project Structure

```
autonomous-incident-agent/
├── apps/
│   ├── web/            # Next.js dashboard (main UI)
│   ├── state/          # Database & project management
│   ├── autopsy/        # AI-powered error analysis
│   ├── router/         # Incident routing & orchestration
│   ├── agent/          # OpenTelemetry receiver (optional)
│   └── docs/           # Documentation site
├── packages/
│   ├── types/          # Shared TypeScript types
│   ├── storage/        # R2/S3 storage client
│   └── ui/             # Shared UI components
├── prisma/
│   └── schema.prisma   # Database schema
├── scripts/
│   └── deploy-production.sh
└── DEPLOYMENT_MONITORING.md
```

## 🧪 Testing

```bash
# All tests
bun test

# Health checks
bun test:health

# Integration tests
bun test:e2e

# Specific service
bun test apps/state/src/health.test.ts
```

## 🐳 Docker Deployment (Self-Hosting)

```bash
# Quick deploy
./scripts/deploy-production.sh

# Manual deploy
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## 📊 Monitoring (Self-Hosting)

Health check endpoints:

```bash
curl http://localhost:3006/        # Web dashboard
curl http://localhost:3003/health  # State service
curl http://localhost:3002/health  # Autopsy service
curl http://localhost:3001/health  # Router service
```

## 🔒 Security

- ✅ Per-project credential isolation
- ✅ Encrypted credentials at rest
- ✅ Clerk-powered authentication
- ✅ HTTPS/TLS in production
- ✅ Rate limiting on webhooks
- ✅ No shared API keys between projects

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vercel** & **GitHub** for deployment platforms
- **Clerk** for authentication
- **Cloudflare R2** for storage
- **OpenAI** / **You.com** for AI capabilities
- **OpenTelemetry** for observability

## 📞 Support

- **Documentation**: [docs](./docs) folder
- **Issues**: [GitHub Issues](https://github.com/sarthakNITT/autonomous-incident-agent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sarthakNITT/autonomous-incident-agent/discussions)

## 🗺️ Roadmap

- [x] Vercel deployment monitoring
- [x] GitHub Pages deployment monitoring
- [x] Auto PR creation
- [x] Manual fix instructions
- [x] Branch auto-discovery
- [ ] Slack/Discord notifications
- [ ] GitLab CI/CD support
- [ ] Netlify integration
- [ ] Custom detection rules
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard

---

**Made with ❤️ by the AIA team**

**Status**: ✅ Production Ready | **Version**: 2.0.0

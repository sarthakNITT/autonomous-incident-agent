# 🤖 Autonomous Incident Agent (AIA)

**AI-powered deployment monitoring and incident resolution for Vercel & GitHub Pages.**

[![Production Ready](https://img.shields.io/badge/production-ready-green.svg)](./QUICKSTART.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Bun](https://img.shields.io/badge/runtime-bun-black.svg)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/dashboard-Next.js_14-black.svg)](https://nextjs.org)

---

## 🌟 What is AIA?

AIA watches your deployments and acts the moment something breaks. When Vercel or GitHub Pages reports a failure, AIA:

1. **Detects** the incident via webhook (instantly)
2. **Analyzes** the root cause using GPT-class AI
3. **Provides** a complete fix toolkit — AI prompts, manual steps, patch diffs
4. **Integrates** with Foxit, Kilo AI, Cline, and Miro for professional-grade incident response

No polling. No manual checks. Just results.

---

## ✨ Features

### 🚨 Deployment Monitoring

- **Vercel webhooks** — Detect deployment failures the moment they happen
- **GitHub Pages webhooks** — Monitor GitHub Actions workflow failures
- **Instant incident creation** — Every failure becomes a tracked incident

### 🧠 AI Analysis (Autopsy Service)

- **Root cause analysis** — AI pinpoints exactly what went wrong and where
- **Patch generation** — Git-diff format patches ready to apply
- **AI fix prompt** — Copy-paste ready prompt for any AI coding assistant
- **Manual fix steps** — Step-by-step numbered instructions for human resolvers
- **Confidence scoring** — Know how certain the AI is about its analysis

### ⚡ Resolution Modes

- **Auto PR Mode** — Automatically creates a GitHub Pull Request with the AI fix
- **Manual Fix Mode** — Shows the fix in the dashboard for your team to apply
- **Per-project settings** — Choose the mode independently for each project

### 📊 Dashboard Features

| Feature                   | Description                                                        |
| :------------------------ | :----------------------------------------------------------------- |
| **Project Management**    | Create projects by linking a GitHub repo + token                   |
| **Branch Auto-Discovery** | Fetches available branches from GitHub automatically               |
| **Incident Cards**        | Full incident detail: root cause, fix steps, patch diff, AI prompt |
| **Incident Timeline**     | Real-time visual progress tracker (auto-refreshes every 10s)       |
| **AI Chat Assistant**     | Conversational AI (You.com) for incident Q&A                       |
| **Voice Control**         | Deepgram-powered speech commands — hands-free navigation           |

### 🔗 Integrations

| Integration              | What it does                                                             |
| :----------------------- | :----------------------------------------------------------------------- |
| 🦊 **Foxit PDF Reports** | Generate a professional PDF for every incident with one click            |
| ⚡ **Kilo AI (VS Code)** | Copies fix prompt to clipboard and opens VS Code with Kilo extension     |
| 🖥 **Cline Pipeline**    | Full automated fix pipeline: analyze → generate fix → validate → resolve |
| 📋 **Miro Boards**       | Export incident details to a visual Miro board for team collaboration    |
| 🐙 **GitHub**            | Auto PR creation, branch management, token-per-project isolation         |

### 🔐 Security

- **Per-project GitHub tokens** — Each project uses its own GitHub PAT (no shared keys)
- **Clerk authentication** — Battle-tested user auth and session management
- **Encrypted credentials** — GitHub tokens stored encrypted at rest

---

## 🚀 Quick Start

### As a Service User

**Zero infrastructure needed.** Just connect your GitHub repo:

```bash
# 1. Visit the dashboard and sign up
# 2. Create a project:
#    - GitHub repo URL
#    - GitHub Personal Access Token
#    - Base branch (auto-detected)
#    - Resolution mode: auto PR or manual fix
#
# 3. Copy the webhook URL and paste it into:
#    - Vercel: Settings → Git → Deploy Hooks
#    - GitHub Pages: Settings → Webhooks
#
# Done! AIA now monitors your deployments.
```

### For Contributors (Local Development)

```bash
git clone https://github.com/sarthakNITT/autonomous-incident-agent.git
cd autonomous-incident-agent

bun install
cp .env.local.example .env.local
# Fill in .env.local (see Environment Variables section below)

# Setup database
cd apps/state
bunx prisma migrate dev
bunx prisma generate
cd ../..

# Start all services
bun run dev
```

| Service         | URL                   | Description            |
| :-------------- | :-------------------- | :--------------------- |
| Web / Dashboard | http://localhost:3006 | Main Next.js app       |
| State Service   | http://localhost:3003 | Database API           |
| Autopsy Service | http://localhost:3002 | AI analysis            |
| Router Service  | http://localhost:3001 | Incident routing       |
| Agent (OTEL)    | http://localhost:4318 | OpenTelemetry receiver |
| Docs            | http://localhost:3007 | Documentation site     |

### For Self-Hosters (Docker)

```bash
cp .env.production.template .env.production
nano .env.production  # Add your credentials

./scripts/deploy-production.sh
```

See [QUICKSTART.md](./QUICKSTART.md) for the full self-hosting guide.

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────┐
│          VERCEL / GITHUB PAGES DEPLOYMENT          │
│               (Your Application)                   │
└─────────────────────┬─────────────────────────────┘
                      │ Deployment fails → sends webhook
                      ▼
┌───────────────────────────────────────────────────┐
│       NEXT.JS WEB APP  (apps/web)                 │
│  /api/webhooks/vercel  /api/webhooks/github        │
│  • Creates incident record                         │
│  • Triggers autopsy analysis                       │
└──────────────┬────────────────────────────────────┘
               │
               ▼
┌───────────────────────────────────────────────────┐
│         AUTOPSY SERVICE  (apps/autopsy)            │
│  • Analyzes error with You.com AI                  │
│  • Generates root cause, patch, fix prompt,        │
│    manual steps, confidence score                  │
└──────┬──────────────────────────────┬─────────────┘
       │                              │
       ▼                              ▼
┌─────────────┐              ┌────────────────────┐
│  AUTO PR    │              │   MANUAL FIX       │
│  • Branch   │              │   • Dashboard card │
│  • Patch    │              │   • AI prompt      │
│  • PR link  │              │   • Fix steps      │
└─────────────┘              └────────────────────┘
                                      │
           ┌──────────────────────────┼──────────────────┐
           │                          │                   │
           ▼                          ▼                   ▼
    ⚡ Fix with Kilo        🖥 Cline Pipeline      🦊 Foxit PDF
    (VS Code + Kilo AI)    (Auto fix agent)      (PDF Report)
                                                          │
                                               📋 Miro Board
                                           (Visual team board)
```

---

## 📦 Project Structure

```
autonomous-incident-agent/
├── apps/
│   ├── web/                # Next.js 14 dashboard (main UI)
│   │   └── src/
│   │       ├── app/
│   │       │   ├── incidents/       # Incident cards + fix actions
│   │       │   ├── timeline/        # Real-time incident timeline
│   │       │   ├── chat/            # AI chat assistant
│   │       │   ├── dashboard/       # Project management
│   │       │   └── api/
│   │       │       ├── webhooks/    # Vercel + GitHub webhook handlers
│   │       │       ├── foxit/       # Foxit PDF generation
│   │       │       ├── kilo/        # Kilo AI VS Code integration
│   │       │       ├── cline/       # Cline automated pipeline
│   │       │       ├── miro/        # Miro board export
│   │       │       ├── voice/       # Deepgram voice commands
│   │       │       ├── chat/        # You.com AI chat
│   │       │       ├── incidents/   # Incident CRUD API
│   │       │       ├── projects/    # Project management API
│   │       │       └── export/      # PDF download (plain)
│   │       └── components/
│   │           ├── voice-control.tsx  # Push-to-talk voice button
│   │           └── ui/               # Shared UI components
│   ├── state/              # Database & project management (Prisma/Postgres)
│   ├── autopsy/            # AI-powered error analysis (You.com)
│   ├── router/             # Incident routing & orchestration
│   ├── agent/              # OpenTelemetry receiver (optional)
│   └── docs/               # Documentation site (Next.js)
├── packages/
│   ├── types/              # Shared TypeScript types
│   ├── storage/            # Cloudflare R2 / S3 storage client
│   └── ui/                 # Shared UI components
├── prisma/
│   └── schema.prisma       # Database schema
└── scripts/
    └── deploy-production.sh
```

---

## 🔧 Environment Variables

### Required (Core)

```bash
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Database (Neon, Supabase, or self-hosted Postgres)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# AI Provider (You.com)
YOU_API_KEY=ydc_...

# Storage (Cloudflare R2 or S3-compatible)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=autonomous-incidents

# Service URLs (for production, set to your deployed URLs)
STATE_SERVICE_URL=http://localhost:3003
AUTOPSY_SERVICE_URL=http://localhost:3002
ROUTER_SERVICE_URL=http://localhost:3001
```

### Optional (Integrations)

```bash
# Foxit PDF Generation (https://developer-api.foxit.com/)
FOXIT_CLIENT_ID=your_client_id
FOXIT_CLIENT_SECRET=your_client_secret

# Deepgram Voice Control (https://deepgram.com/)
DEEPGRAM_API_KEY=your_deepgram_key

# Miro Board Export (https://miro.com/app/settings/user-profile/apps)
MIRO_ACCESS_TOKEN=your_miro_token
```

See [.env.local.example](./.env.local.example) for a complete template.

---

## 🎯 How Each Feature Works

### Incident Card Actions

Every incident on the dashboard has a full action toolbar:

| Button                | Action                                                         |
| :-------------------- | :------------------------------------------------------------- |
| **Download PDF**      | Exports incident as a PDF via `/api/export/:id`                |
| **Foxit Report**      | Generates a professional PDF via Foxit Document Generation API |
| **Fix with Kilo ⚡**  | Copies AI fix prompt + opens VS Code with Kilo extension       |
| **Cline Pipeline**    | Launches a multi-step automated fix pipeline with live status  |
| **Visualize in Miro** | Creates a visual Miro board for team collaboration             |
| **View PR**           | Opens the automatically created GitHub Pull Request            |

### Incident Timeline

The `/timeline` page shows every incident as a 5-stage progress bar:

```
Detected → Analyzing → Patching → Validating → Resolved
```

Auto-refreshes every 10 seconds with filter buttons for each status.

### AI Chat Assistant

The `/chat` page provides a full conversational interface powered by You.com AI. Ask about incidents, get fix guidance, or explore best practices.

### Voice Control

Hold the microphone button (🎤) in the navbar to issue voice commands:

- _"Show incidents"_ → navigate to `/incidents`
- _"Status summary"_ → see a count of total/resolved/open incidents
- _"Show latest incident"_ → jump to the most recent incident
- _"Show critical incidents"_ → filter for critical incidents

Powered by **Deepgram Nova-2** speech-to-text.

---

## 🌍 Production Deployment

AIA is deployed as a hybrid of free-tier services:

| Layer            | Platform      | Service              |
| :--------------- | :------------ | :------------------- |
| **Frontend/API** | Vercel        | `apps/web` (Next.js) |
| **Database**     | Neon          | PostgreSQL           |
| **Storage**      | Cloudflare R2 | Incident snapshots   |
| **AI**           | You.com       | Root cause analysis  |
| **Auth**         | Clerk         | User management      |

Backend services (State, Autopsy, Router) are deployed on **Render** (free tier).

See [QUICKSTART.md](./QUICKSTART.md) for step-by-step deployment instructions.

---

## 🤝 Contributing

```bash
# 1. Fork the repository
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/autonomous-incident-agent.git
cd autonomous-incident-agent

bun install
cp .env.local.example .env.local

cd apps/state && bunx prisma migrate dev && bunx prisma generate && cd ../..
bun run dev

# 3. Create a feature branch
git checkout -b feature/my-feature

# 4. Make changes, then test
bun test

# 5. Commit and push
git commit -m 'feat: add my feature'
git push origin feature/my-feature

# 6. Open a Pull Request
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 🧪 Testing

```bash
# All tests
bun test

# Health checks
curl http://localhost:3006/api/health-check   # Web app
curl http://localhost:3003/health              # State service
curl http://localhost:3002/health              # Autopsy service
curl http://localhost:3001/health              # Router service
```

---

## 📚 Documentation

Full docs are available in `apps/docs` and cover:

- [Getting Started](./apps/docs/content/GettingStarted.mdx)
- [Webhook Setup](./apps/docs/content/Webhooks.mdx)
- [Foxit PDF Reports](./apps/docs/content/FoxitReports.mdx)
- [Kilo AI Integration](./apps/docs/content/KiloIntegration.mdx)
- [Cline Pipeline](./apps/docs/content/ClinePipeline.mdx)
- [Miro Integration](./apps/docs/content/MiroIntegration.mdx)
- [Voice Control](./apps/docs/content/VoiceControl.mdx)
- [AI Chat Assistant](./apps/docs/content/AIChat.mdx)
- [Incident Timeline](./apps/docs/content/IncidentTimeline.mdx)
- [AI Engine (Autopsy)](./apps/docs/content/AIEngine.mdx)
- [Architecture](./apps/docs/content/Architecture.mdx)
- [Troubleshooting](./apps/docs/content/Troubleshooting.mdx)

---

## 🗺️ Roadmap

- [x] Vercel webhook monitoring
- [x] GitHub Pages webhook monitoring
- [x] AI root cause analysis (You.com)
- [x] Auto PR creation
- [x] Manual fix mode with AI prompt
- [x] Branch auto-discovery
- [x] Profile management
- [x] Incident Timeline (real-time visual tracker)
- [x] AI Chat Assistant (You.com)
- [x] Voice Control (Deepgram)
- [x] Foxit PDF Report generation
- [x] Kilo AI VS Code integration
- [x] Cline automated fix pipeline
- [x] Miro board export
- [ ] Slack/Discord notifications
- [ ] GitLab CI/CD support
- [ ] Netlify integration
- [ ] Custom detection rules
- [ ] Team workspaces

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

## 🙏 Sponsors & Acknowledgments

- **[Foxit](https://developer-api.foxit.com/)** — Document Generation & PDF APIs
- **[Kilo AI](https://kilo.codes/)** — AI coding agent for VS Code
- **[Miro](https://miro.com)** — Visual collaboration platform
- **[Deepgram](https://deepgram.com)** — Speech-to-text AI
- **[You.com](https://you.com)** — AI capabilities & chat
- **[Clerk](https://clerk.com)** — Authentication
- **[Neon](https://neon.tech)** — Serverless Postgres
- **[Cloudflare R2](https://developers.cloudflare.com/r2/)** — Object storage
- **[Vercel](https://vercel.com)** — Frontend deployment

---

**Made with ❤️ for the developer community**

**Status**: Production Ready | **Version**: 3.0.0

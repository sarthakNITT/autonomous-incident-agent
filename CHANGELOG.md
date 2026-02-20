# Changelog

All notable changes to this project will be documented in this file.

## [3.0.0] - 2026-02-20

### Added

- **Foxit PDF Reports** — Professional incident PDFs via Foxit Document Generation API. Pure JS DOCX builder (no external zip deps). `/api/foxit/report/:id`
- **Kilo AI Integration** — One-click "Fix with Kilo" button: generates AI fix prompt, copies to clipboard, opens VS Code with Kilo extension. `/api/kilo/prompt`
- **Cline Pipeline** — Multi-step automated fix pipeline with live status modal. Steps: fetch → analyze → generate fix → validate → update status. `/api/cline/pipeline`
- **Miro Board Export** — Export incident details to a visual Miro board for team post-mortems. `/api/miro/create-board`
- **Voice Control (Deepgram)** — Push-to-talk voice commands in the navbar. Powered by Deepgram Nova-2. `/api/voice/command`
- **AI Chat Assistant** — Conversational AI interface powered by You.com. `/api/chat` + `/chat` page
- **Incident Timeline** — Real-time visual lifecycle tracker with 5-stage progress bar. Auto-refreshes every 10s. `/timeline` page
- **Incident Timeline Filters** — Filter timeline by status: all, detected, analyzing, patching, resolved, failed
- **Deepgram voice commands** — `list_incidents`, `critical_incidents`, `latest_incident`, `status_summary`

### Changed

- Incident cards now show full **repo URL** (not just repo name) with clickable GitHub link
- `repo_name` and `file_path` now persisted on incident creation from webhook payload
- Incident cards now show **Foxit Report** and **Cline Pipeline** buttons alongside existing actions
- Improved error handling in API routes (specific catch types, better logging)
- Updated `.env.local.example` with all integration credentials (Foxit, Deepgram, Miro)

## [2.0.0] - 2026-02-16

### Added

- **Webhook-based monitoring** — Vercel (`/api/webhooks/vercel`) and GitHub Pages (`/api/webhooks/github`) webhook handlers
- **Per-project credential model** — Each project stores its own GitHub token encrypted separately
- **Resolution mode per project** — Toggle between Auto PR (creates GitHub PR) and Manual Fix (shows steps in dashboard)
- **Branch auto-discovery** — Fetches available GitHub branches when creating a project
- **User profile management** — Update account settings from the dashboard
- **Clerk authentication** — Full sign-in/sign-up/session management
- **Next.js 14 web app** (`apps/web`) as the main dashboard (replaces old `apps/dashboard`)
- **Incident cards** with root cause, confidence score, AI fix prompt, manual steps, patch diff viewer
- **Auto PR toggle** — Flip resolution mode from the incident card

### Changed

- Deployment shifted from OTEL-first to webhook-first architecture
- Dashboard rewritten in Next.js 14 with Tailwind CSS and shadcn/ui components
- PostgreSQL schema migrated via Prisma, deployed on Neon

## [1.0.0] - 2026-02-05

### Added

- **Phase 1**: Initial Turborepo scaffold with Bun workspace. `sample-app` implemented with seeded failure mode.
- **Phase 2**: `apps/agent` service for log monitoring and incident detection using regex patterns.
- **Phase 3**: `apps/router` service for event ingestion and snapshot persistence.
- **Phase 4**: `apps/autopsy` service for heuristic root cause analysis and patch generation.
- **Phase 5**: `pr_generator` utility for creating GitHub-ready PR artifacts and reproduction tests.
- **Phase 6**: `repro` harness using Docker Compose for verifying generated patches automatically.
- **Phase 7**: `apps/dashboard` web service and PDF reporting tool.
- **Phase 8**: End-to-end CI demo pipeline (`demo/run_demo.ts`) and GitHub Actions workflow.
- **Phase 9**: Extended bug scenarios (Crash, CPU Timeout) and final documentation polish.

### Security

- Implemented strict no-comment policy for source code to prevent sensitive data leakage.
- Containerized all services for isolation.

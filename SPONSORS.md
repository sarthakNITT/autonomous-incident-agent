# Features & Sponsor Integrations

AIA integrates with best-in-class technology providers to deliver a comprehensive incident response platform.

| Feature                    | Integration                                             | Provider                            | Status |
| -------------------------- | ------------------------------------------------------- | ----------------------------------- | ------ |
| **AI Chat & Analysis**     | You.com AI chat assistant + Autopsy root cause analysis | **You.com**                         | Live   |
| **Voice Control**          | Speech-to-text for dashboard voice commands             | **Deepgram** (Nova-2)               | Live   |
| **PDF Reports**            | Professional incident PDF generation from DOCX          | **Foxit** (Document Generation API) | Live   |
| **VS Code Fix Workflow**   | One-click AI fix prompt → VS Code with Kilo extension   | **Kilo AI**                         | Live   |
| **Automated Fix Pipeline** | Multi-step analyze → fix → validate pipeline            | **Cline**                           | Live   |
| **Visual Collaboration**   | Export incidents as Miro boards for team reviews        | **Miro**                            | Live   |
| **Authentication**         | User management and session handling                    | **Clerk**                           | Live   |
| **Database**               | Serverless Postgres for incidents and projects          | **Neon**                            | Live   |
| **Object Storage**         | Incident snapshots and patch file storage               | **Cloudflare R2**                   | Live   |

## Integration Implementation Details

### 🦊 Foxit (Document Generation API)

- **Endpoint**: `POST /api/foxit/report/:id`
- **What it does**: Programmatically builds a DOCX (pure JavaScript ZIP + OOXML) with incident fields, sends it to Foxit's `GenerateDocumentBase64` endpoint, and streams a PDF back to the browser
- **Required env vars**: `FOXIT_CLIENT_ID`, `FOXIT_CLIENT_SECRET`
- **Doc**: [Foxit PDF Reports](/docs/integrations/foxit)

### 🎤 Deepgram (Nova-2 Speech-to-Text)

- **Endpoint**: `POST /api/voice/command`
- **What it does**: Records audio from the browser microphone, transcribes via Deepgram Nova-2, and maps spoken commands to dashboard navigation actions
- **Supported commands**: list incidents, critical incidents, latest incident, status summary
- **Required env vars**: `DEEPGRAM_API_KEY`
- **Doc**: [Voice Control](/docs/features/voice)

### ⚡ Kilo AI (VS Code Extension)

- **Endpoint**: `POST /api/kilo/prompt`
- **What it does**: Generates a formatted AI fix prompt from incident data, copies it to clipboard, and opens VS Code with the Kilo extension URI
- **Required**: Kilo Code VS Code extension installed
- **Doc**: [Kilo Integration](/docs/integrations/kilo)

### 🖥 Cline (Automated Fix Pipeline)

- **Endpoints**: `POST /api/cline/pipeline`, `GET /api/cline/pipeline?pipeline_id=...`
- **What it does**: Runs a real-time multi-step pipeline (fetch → analyze → generate fix → validate → update status) with live progress updates in a dashboard modal
- **Doc**: [Cline Pipeline](/docs/integrations/cline)

### 📋 Miro (Visual Boards)

- **Endpoint**: `POST /api/miro/create-board`
- **What it does**: Creates a new Miro board with incident details (title, root cause, fix steps) pre-populated for team collaboration
- **Required env vars**: `MIRO_ACCESS_TOKEN`
- **Doc**: [Miro Integration](/docs/integrations/miro)

### 💬 You.com (AI Analysis + Chat)

- **Used by**: Autopsy service (root cause analysis) + `/api/chat` (chat assistant)
- **What it does**: Powers the AI engine that analyzes error logs, generates patches, fix prompts, and manual steps; also drives the chat assistant
- **Required env vars**: `YOU_API_KEY`
- **Doc**: [AI Engine](/docs/architecture/ai-engine)

# Autonomous Incident Agent (AIA)

This repository contains a demonstration of an Autonomous Incident Agent (AIA) capable of detecting and reporting failure scenarios.

## Configuration

The platform is configured via `config/aia.config.yaml`. This file controls ports, paths, environment tags, service behavior, and storage.

### Observability (OpenTelemetry)

The Agent services act as an OpenTelemetry Receiver on port **4318** (HTTP).
To monitor your application, configure the OOTB OpenTelemetry Exporter:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
export OTEL_SERVICE_NAME="my-app"
```

The Agent automatically detects:

- HTTP 5xx errors
- Uncaught exceptions
- Latency spikes (>2000ms)
- Process crashes (via log patterns)

# Quick Start

## Onboarding

Run the automated installer to configure your environment:

```bash
bun run cli/install.ts
```

## Documentation

Start the local documentation site for architecture details and guides:

```bash
bun run apps/docs/src/server.ts
```

Then visit `http://localhost:3008`.

## Web Dashboard

Launch the user interface:

```bash
bun run apps/web/src/server.ts
```

Visit `http://localhost:3007`.

## For Contributors

If you're contributing to this project, you'll need to set up your local environment:

1. **Clone the repository**
2. **Create `.env` file** with your API keys:
   ```bash
   YOU_API_KEY=ydc_your_key_here
   GITHUB_TOKEN=ghp_your_token_here
   ```
3. **Create `aia.config.local.yaml`** (gitignored) with your GitHub details:
   ```yaml
   # Copy from aia.config.yaml and update these fields:
   github:
     owner: "your-github-username"
     repo: "your-test-repo-name"
   ```
4. **Run the dev server**: `bun run dev`

The system will automatically use `aia.config.local.yaml` if it exists, allowing you to test without modifying the main config file.

### AI (You.com)

The Autopsy engine uses You.com API for reasoning.

1. Obtain an API Key from [You.com](https://you.com) (or relevant developer portal).
2. Update `config/aia.config.yaml`:
   ```yaml
   ai:
     provider: "you.com"
     api_key: "YOUR_API_KEY"
     model: "you-chat-gpt-4"
   ```

### GitHub Integration (Required for PR Creation)

The system creates Pull Requests automatically when incidents are detected and analyzed. To enable this:

#### Step 1: Create a GitHub Personal Access Token

1. **Go to GitHub Settings**:
   - Visit [https://github.com/settings/tokens](https://github.com/settings/tokens)
   - Click **"Generate new token"** → **"Generate new token (classic)"**

2. **Configure Token Permissions**:
   - **Note**: Enter a descriptive name (e.g., "AIA Incident Agent")
   - **Expiration**: Choose your preferred expiration (recommend 90 days or No expiration for testing)
   - **Select scopes**: Check the following permissions:
     - ✅ `repo` (Full control of private repositories)
       - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
     - ✅ `workflow` (Update GitHub Action workflows) - _Optional, only if your repo uses GitHub Actions_

3. **Generate and Copy Token**:
   - Click **"Generate token"** at the bottom
   - **IMPORTANT**: Copy the token immediately (format: `ghp_xxxxxxxxxxxx`)
   - You won't be able to see it again!

#### Step 2: Configure the Token in Your Environment

1. **Add to `.env` file**:

   ```bash
   GITHUB_TOKEN=ghp_your_actual_token_here
   ```

2. **Update `aia.config.yaml`**:

   ```yaml
   github:
     provider: "github"
     token: "PLACEHOLDER" # Will be read from .env
     owner: "your-github-username" # REQUIRED: Your GitHub username (e.g., "sarthakNITT")
     repo: "your-repo-name" # REQUIRED: Your repository name (e.g., "my-project")
     base_branch: "main"
   ```

   **Important**: Replace `your-github-username` and `your-repo-name` with your actual GitHub username and the repository where you want PRs to be created.

   **Example**:
   - If your repo is `https://github.com/johndoe/my-awesome-app`
   - Set `owner: "johndoe"`
   - Set `repo: "my-awesome-app"`

   **💡 Tip for Local Testing**: Create a `aia.config.local.yaml` file (gitignored) with your actual values to test without modifying the main config.

#### Step 3: Verify Token Permissions

The token needs access to:

- **Create branches** in your repository
- **Push commits** to those branches
- **Create Pull Requests**

**Note**: The system will create branches named `aia/incident-{incident-id}` and push fixes there before creating PRs.

#### Troubleshooting GitHub Integration

- **404 Error**: Check that `owner` and `repo` in `aia.config.yaml` match your actual GitHub repository
- **403 Error**: Your token doesn't have sufficient permissions - regenerate with `repo` scope
- **Push Failed**: Ensure your token has write access to the repository

### Database (State Layer)

The `apps/state` service uses SQLite by default to track incident lifecycle.

- **Location**: `aira.db` in the project root.
- **Schema**: Automatically created on startup (`db.ts`).
- **Inspection**: Use `bun:sqlite` or any SQLite viewer to inspect `incidents` table.

### Automated Validation

The system includes a CI/CD pipeline for automated remediation validation:

1. **Trigger**: Phase 14 creates a PR with branch `aia/incident-{id}`.
2. **Action**: `.github/workflows/validate-pr.yml` triggers the `apps/repro` container.
3. **Execution**:
   - Downloads `patch.diff` and `generated_test.ts` from R2.
   - Applies patch and runs tests in isolation.
   - Reports results back to R2 and validates the PR.

> [!IMPORTANT]
> The validation pipeline requires Docker and access to the R2 bucket.

- **Ports**: Change `services.<name>.port` to resolve conflicts.
- **Paths**: `paths.repo_root` defines the target repository to analyze.
- **AI Provider**: (Placeholder) Add `ai` section to config in future phases.

### Directory Mapping

When running in Docker, the `config/` directory is mounted to `/app/config`.

- **Local Dev**: Edit `config/aia.config.yaml` and restart services.
- **Docker**: Rebuild using `docker-compose up --build` if changing paths structure, otherwise restart is sufficient.

## Run Demo

```bash
bun run demo/run_demo.ts --scenario 1
```

## Manual Setup

See `docs/` for### Web Dashboard
The new Web Client (Phase 17) provides a rich interface for managing incidents.

- **Port**: 3007 (default)
- **Features**: Real-time status timeline, patch review, and manual approval/rejection.
- **Access**: Open `http://localhost:3007` in your browser.

## Service Architecture.

## Migration Guide (Phase 10)

We have migrated from hardcoded constants to `aia.config.yaml`.

- Old `apps/dashboard/src/index.ts` hardcoded ports -> Now uses `config.services.dashboard.port`.
- Old file paths -> Now use `config.paths.*`.

## Repository Structure

- `apps/sample-app`: A lightweight Bun service that can be triggered to fail.
- `apps/agent`: A monitoring service that detects failures and emits incident reports.
- `packages/types`: Shared TypeScript definitions.
- `events/`: Directory where incident reports are output.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- Docker & Docker Compose

### 1. Verification (Phase 2)

To verify the agent monitoring and incident generation:

**1. Start the services:**

```bash
docker-compose up --build
```

**2. Trigger the failure:**
Open a new terminal and run:

```bash
curl -X POST http://localhost:3000/trigger \
     -H "Content-Type: application/json" \
     -d @test/bug-scenarios/scenario-1.json
```

**3. Verify Agent Response:**
Check the agent logs in the docker terminal. You should see "FAILURE DETECTED!".

**4. Check Generated Event:**
Verify that `events/incident-1.json` has been created and contains the failure details.

```bash
cat events/incident-1.json
```

### 2. Verification (Phase 3: Router)

To verify the event router ingestion:

**1. Send the incident to the router:**

```bash
curl -X POST http://localhost:4000/ingest \
     -H "Content-Type: application/json" \
     -d @events/incident-1.json
```

**2. Verify Response:**
Should return: `{"snapshot_id":"..."}`

**3. Verify Storage:**
Check that a snapshot file exists in `router/storage/`.

### 3. Verification (Phase 4: Autopsy)

To verify the autopsy engine analysis:

**1. Call the analysis endpoint:**
Replace `<SNAPSHOT_ID>` with the ID returned from the router.

```bash
curl -X POST http://localhost:5001/analyze \
     -H "Content-Type: application/json" \
     -d '{ "snapshot_id": "<SNAPSHOT_ID>", "repo_path": "/repo" }'
```

**2. Verify Response:**
Should return a JSON object with `root_cause_text` and `suggested_patch`.

**3. Check Output File:**
Verify `autopsy/sample_output/incident-1-autopsy.json` exists.

### 4. Verification (Phase 5: PR Generator)

To generate PR artifacts from the autopsy result:

**1. Run the generator:**

```bash
bun run apps/autopsy/pr_generator.ts
```

**2. Verify Outputs:**
Check for created files:

- `autopsy/patches/patch-1.diff`
- `autopsy/pr_description/incident-1-pr.md`
- `app/test/generated/repro.test.ts`

### 4. Verification (Phase 5: PR Generator)

To generate PR artifacts from the autopsy result:

**1. Run the generator:**

```bash
bun run apps/autopsy/pr_generator.ts
```

**2. Verify Outputs:**
Check for created files:

- `app/test/generated/repro.test.ts`

### 5. Verification (Phase 6: Reproduction Harness)

To verify the patch effectiveness using the containerized harness:

**1. Run the harness:**

```bash
bun run repro/run_repro.ts
```

**2. Verify Logs:**

- `repro/logs/pre.txt`: Should show the test failing (HTTP 500).
- `repro/logs/post.txt`: Should show the test passing (HTTP 200).

### 6. Verification (Phase 7: Dashboard & Reporting)

**1. Start the Dashboard:**

```bash
docker-compose up -d dashboard
```

**2. View Incident Report:**
Open [http://localhost:3002/incident-1](http://localhost:3002/incident-1) in your browser.

**3. Generate PDF Report:**

```bash
bun run apps/dashboard/src/export.ts
```

Verify `dashboard/reports/incident-1.pdf` is created.

### 7. End-to-End Demo (Phase 8 & 9)

Run the entire pipeline (Trigger -> Agent -> Router -> Autopsy -> Patch -> Verify -> Report) in one command:

```bash
# Default: Scenario 1 (Deterministic Error)
bun run demo/run_demo.ts

# Scenario 2 (Null Pointer / Crash)
bun run demo/run_demo.ts --scenario 2

# Scenario 3 (CPU Timeout)
bun run demo/run_demo.ts --scenario 3
```

This will:

1. Reset the environment.
2. Spin up the entire stack.
3. Simulate the chosen incident.
4. Auto-generate a fix and verify it.
5. Export all artifacts to `demo/output`.

**Expected Runtime:** ~2 minutes per scenario.

## Troubleshooting

- **Docker Errors**: Ensure Docker is running. If network errors occur, run `docker-compose down -v` to clear state.
- **Port Conflicts**: Ensure ports 3000, 3002, 4000, 5001 are free.
- **Permissions**: Ensure `bun run` commands are executed with sufficient permissions to write to artifact directories.

## Security & Privacy Note

This project is a demonstration. All processed data is **synthetic**. The "incidents" are seeded bug scenarios, and no real production data, secrets, or PII are ever accessed or transmitted. The "Autopsy" logic uses local heuristics and does not send code to external services in this standalone configuration.

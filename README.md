# Autonomous Incident Agent (AIA)

This repository contains a demonstration of an Autonomous Incident Agent (AIA) capable of detecting and reporting failure scenarios.

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

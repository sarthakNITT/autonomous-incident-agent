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

# Autonomous Incident Agent - Phase 1

This repository contains the initial scaffold for the Autonomous Incident Agent demo. It currently features a `sample-app` built with Bun and TypeScript, managed via Turborepo.

## Prerequisites

- [Bun](https://bun.sh/) (latest)
- [Docker](https://www.docker.com/) & Docker Compose

## Installation

1. Install dependencies using Bun:
   ```bash
   bun install
   ```

## Running the Sample Application

1. Start the service using Docker Compose:
   ```bash
   docker-compose up --build
   ```
   This will start the `sample-app` service on port 3000.

## Verifying the Seeded Bug

The `sample-app` contains a deterministic bug that can be triggered via a specific payload.

1. Ensure the app is running (see above).
2. Run the following command to trigger the bug:
   ```bash
   curl -X POST http://localhost:3000/trigger \
        -H "Content-Type: application/json" \
        -d @test/bug-scenarios/scenario-1.json
   ```
3. Observe the logs in your docker-compose terminal. You should see a stack trace starting with:
   `Error: SeededDemoFailure: deterministic bug for AIA demo`

## Repository Structure

- `apps/sample-app`: The main service exposing the HTTP endpoint.
- `packages/types`: Shared TypeScript types.
- `test/bug-scenarios`: JSON payloads for testing specific scenarios.
- `turbo.json`: Turborepo configuration.
- `bunfig.toml`: Bun configuration.

## Design Decisions

- **Bun**: Used for both package management and runtime to ensure speed and simplicity.
- **Turborepo**: Manages the monorepo structure, allowing for efficient builds and task execution across workspaces.
- **Docker**: Ensures consistent execution environment for the demo.
- **Deterministic Bug**: The "bug" is explicitly coded to throw when a specific payload is received, ensuring reliable demonstration of incident handling capabilities.

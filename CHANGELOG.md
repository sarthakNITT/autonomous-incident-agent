# Changelog

All notable changes to this project will be documented in this file.

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

# Features & Sponsor Integrations

This project demonstrates how various advanced features map to specific technology providers and sponsors.

| Feature / Component | Integration | Technology Provider |
|---------------------|-------------|---------------------|
| **AI Reasoning** | Autopsy analysis & patch generation | **You.com APIs** |
| **CI Automation** | Pipeline execution & artifact management | **Buildkite / GitHub Actions** |
| **Hosting & Infrastructure** | Production deployment target | **Linode** |
| **Reporting** | Post-mortem PDF generation associated with dashboard | **Foxit** |
| **Visualization** | Incident Dashboard backend & UI concepts | **Retool** (option) |
| **Workflow Automation** | End-to-end autonomous agent loop | **Kilo / CLINE** |

## Integration Details

- **You.com**: Used for context-aware search and reasoning during the root cause analysis phase in `apps/autopsy`.
- **Foxit**: Logic for generating high-fidelity PDF reports embedded in `apps/dashboard`.
- **Linode**: The reference architecture is designed to run efficiently on Linode instances or Kubernetes clusters.

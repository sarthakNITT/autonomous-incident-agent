# Contributing to Autonomous Incident Agent (AIA)

Thank you for your interest in contributing to AIA! This document provides guidelines and instructions for contributors.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Bun** runtime (v1.0+) - [Install Bun](https://bun.sh)
- **PostgreSQL** database (v14+)
- **Node.js** 20+ (for some tooling)
- **Git**
- **Docker** (optional, for testing production builds)

### Development Setup

1. **Fork and Clone**

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/autonomous-incident-agent.git
cd autonomous-incident-agent
```

2. **Install Dependencies**

```bash
bun install
```

3. **Set Up Environment Variables**

```bash
# Copy the local development template
cp .env.local.example .env.local

# Edit with your credentials
nano .env.local
```

**Required credentials:**

- **Clerk** (free): https://clerk.com - For authentication
- **You.com API** or **OpenAI**: For AI analysis
- **Cloudflare R2**: For storage (free tier available)
- **PostgreSQL**: Local database

4. **Set Up Database**

```bash
# Navigate to state service
cd apps/state

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Return to root
cd ../..
```

5. **Start Development Servers**

```bash
# Start all services in development mode
bun run dev
```

This will start:

- **Web Dashboard**: http://localhost:3006
- **State Service**: http://localhost:3003
- **Router**: http://localhost:3001
- **Autopsy**: http://localhost:3002
- **Agent (OTel)**: http://localhost:4318

## 📁 Project Structure

```
autonomous-incident-agent/
├── apps/
│   ├── agent/          # OTel receiver & incident detector
│   ├── router/         # Incident router & orchestrator
│   ├── autopsy/        # AI-powered root cause analysis
│   ├── state/          # State management & PostgreSQL
│   ├── web/            # Next.js dashboard
│   └── docs/           # Documentation site
├── packages/
│   ├── storage/        # R2 storage client
│   ├── types/          # Shared TypeScript types
│   └── ui/             # Shared UI components
└── shared/
    └── config_loader/  # Configuration loader
```

## 🔧 Development Workflow

### 1. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clean, readable code
- Follow existing patterns and conventions
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run type checking
bun run type-check

# Run linting
bun run lint

# Run tests (if available)
bun test

# Test the full flow manually
# 1. Start dev servers: bun run dev
# 2. Sign in to dashboard
# 3. Create a project
# 4. Trigger a test incident
# 5. Verify it appears in dashboard
```

### 4. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add amazing feature"

# Or for bug fixes
git commit -m "fix: resolve issue with X"
```

**Commit Message Format:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Go to GitHub and create a Pull Request
```

## 🎨 Code Style

### TypeScript

- Use TypeScript for all code
- Avoid `any` types when possible
- Use proper type definitions from `@repo/types`
- Export types that might be reused

### Formatting

- **Prettier** runs automatically on commit
- Use 2 spaces for indentation
- Use double quotes for strings
- Add trailing commas

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Components**: `PascalCase.tsx`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

### Example

```typescript
// Good
interface ProjectConfig {
  name: string;
  repoUrl: string;
  githubToken?: string;
}

async function fetchProjectConfig(projectId: string): Promise<ProjectConfig> {
  const response = await fetch(`/api/projects/${projectId}`);
  return response.json();
}

// Bad
interface project_config {
  Name: string;
  repo_url: string;
  github_token: any;
}

function FetchProjectConfig(id: any) {
  // ...
}
```

## 🧪 Testing

### Manual Testing

1. **Start dev servers**: `bun run dev`
2. **Test the flow**:
   - Sign in to dashboard
   - Create a project
   - Trigger an incident (send OTel data)
   - Verify incident appears
   - Check autopsy results
   - Test PDF generation

### Automated Testing

```bash
# Run all tests
bun test

# Run specific service tests
cd apps/autopsy
bun test
```

## 📚 Documentation

### When to Update Docs

Update documentation when you:

- Add a new feature
- Change existing behavior
- Add new configuration options
- Update environment variables
- Change API endpoints

### Documentation Files

- **README.md** - Main project overview
- **QUICKSTART.md** - Quick deployment guide
- **PRODUCTION_DEPLOYMENT.md** - Detailed deployment
- **PROJECT_CREDENTIALS_INTEGRATION.md** - Technical details
- **CONTRIBUTING.md** - This file

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the issue already exists
2. Try to reproduce in a clean environment
3. Gather relevant information:
   - OS and version
   - Bun version
   - Error messages
   - Steps to reproduce

### Bug Report Template

```markdown
**Description**
A clear description of the bug.

**Steps to Reproduce**

1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**

- OS: [e.g., macOS 14.0]
- Bun version: [e.g., 1.0.0]
- Node version: [e.g., 20.0.0]

**Logs**
```

Paste relevant logs here

```

```

## 💡 Feature Requests

We welcome feature requests! Please:

1. Check if the feature already exists or is planned
2. Describe the feature clearly
3. Explain the use case
4. Provide examples if possible

## 🔍 Code Review Process

### What We Look For

- **Functionality**: Does it work as intended?
- **Code Quality**: Is it clean and maintainable?
- **Tests**: Are there tests (if applicable)?
- **Documentation**: Is it documented?
- **Performance**: Does it impact performance?
- **Security**: Are there security concerns?

### Review Timeline

- Initial review: Within 2-3 days
- Follow-up reviews: Within 1-2 days
- Merge: After approval and CI passes

## 🎯 Areas to Contribute

### Good First Issues

- Documentation improvements
- UI/UX enhancements
- Bug fixes
- Test coverage
- Code refactoring

### Advanced Contributions

- New detection algorithms
- AI model improvements
- Performance optimizations
- New integrations (Slack, Discord, etc.)
- Advanced analytics

## 📞 Getting Help

- **Questions**: Open a [Discussion](https://github.com/sarthakNITT/autonomous-incident-agent/discussions)
- **Bugs**: Open an [Issue](https://github.com/sarthakNITT/autonomous-incident-agent/issues)
- **Chat**: Join our community (link TBD)

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Thank you for contributing to AIA! Your contributions help make incident management better for everyone.

---

**Happy Coding!** 🚀

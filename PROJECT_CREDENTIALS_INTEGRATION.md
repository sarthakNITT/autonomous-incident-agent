# Project Credentials Integration - Complete

## ✅ What Was Implemented

### 1. **Router Service** (`apps/router/src/index.ts`)

- ✅ Fetches project configuration from state service using `project_id`
- ✅ Extracts project-specific credentials (GitHub token, OpenAI key, repo URL, base branch)
- ✅ Uses project repo URL instead of hardcoded "local-sample-repo"
- ✅ Passes project credentials to autopsy service
- ✅ Updates incident with project name and initial file path

**Key Changes:**

```typescript
if (event.project_id) {
  const projectRes = await fetch(
    `${STATE_SERVICE_URL}/projects/${event.project_id}`,
  );
  projectConfig = await projectRes.json();
}

const repoRef: RepoRef = {
  repo_url: projectConfig?.repo_url || "local-sample-repo",
  branch: projectConfig?.base_branch || "main",
};

const autopsyPayload = {
  snapshot_key: key,
  incident_id: event.id,
  github_token: projectConfig?.github_token,
  openai_api_key: projectConfig?.openai_api_key,
  repo_url: projectConfig?.repo_url,
  base_branch: projectConfig?.base_branch,
};
```

### 2. **Autopsy Service** (`apps/autopsy/src/index.ts`)

- ✅ Accepts project-specific credentials in `/analyze` endpoint
- ✅ Uses project OpenAI key if provided, otherwise falls back to default
- ✅ Logs which credentials are being used (project vs default)
- ✅ Creates new AI reasoner instance with project key when needed

**Key Changes:**

```typescript
const projectGithubToken = body.github_token;
const projectOpenAIKey = body.openai_api_key;
const projectRepoUrl = body.repo_url;
const projectBaseBranch = body.base_branch;

const projectReasoner = projectOpenAIKey
  ? new YouComReasoner(projectOpenAIKey, aiConfig.model)
  : reasoner;

const aiResponse = await projectReasoner.analyze(request);
```

## 🔄 Complete Flow

### Before (Old Flow):

1. Agent detects incident → tags with `projectId`
2. Router receives incident → uses hardcoded "local-sample-repo"
3. Autopsy analyzes → uses global OpenAI key
4. **Problem:** Project credentials ignored

### After (New Flow):

1. Agent detects incident → tags with `projectId`
2. Router receives incident → **fetches project from state service**
3. Router extracts credentials → **passes to autopsy**
4. Autopsy uses **project-specific OpenAI key** for analysis
5. **Result:** Each project uses its own credentials! ✅

## 📊 What This Enables

### For Users:

- ✅ Add multiple projects with different repositories
- ✅ Each project can have its own GitHub token
- ✅ Each project can have its own OpenAI API key
- ✅ Incidents are analyzed using the correct project context
- ✅ Costs are isolated per project (different API keys)

### For System:

- ✅ Multi-tenant support
- ✅ Credential isolation
- ✅ Fallback to defaults if project not configured
- ✅ Logging shows which credentials are used

## 🧪 Testing Checklist

- [ ] Create a project with custom OpenAI key
- [ ] Trigger an incident with that project's `projectId`
- [ ] Verify autopsy logs show "Using project-specific OpenAI key"
- [ ] Verify autopsy analysis completes successfully
- [ ] Verify incident shows correct repository name
- [ ] Create project without custom keys
- [ ] Verify it falls back to default credentials

## 🚀 Production Readiness

### ✅ Completed:

- ✅ Router fetches and uses project credentials
- ✅ Autopsy accepts and uses project credentials
- ✅ Fallback to defaults when project not found
- ✅ Logging for debugging

### ⚠️ Still Needed:

- ⚠️ Git service integration (use project GitHub token for cloning/PRs)
- ⚠️ End-to-end testing
- ⚠️ Production environment variables
- ⚠️ Remove old dashboard service

## 📝 Next Steps

1. **Test the flow** (30 min)
   - Sign in to dashboard
   - Create a project with custom API key
   - Trigger an incident
   - Verify credentials are used

2. **Update Git Service** (20 min)
   - Pass project GitHub token to git operations
   - Use for cloning and creating PRs

3. **Production Config** (15 min)
   - Document required env vars
   - Set up production database
   - Configure R2 storage

**Estimated time to production: ~1 hour**

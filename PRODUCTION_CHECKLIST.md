# Production Readiness Checklist

## ✅ Fixed Issues

### 1. Duplicate Incident Detection

- **Status**: FIXED
- **Change**: Modified deduplication logic to use error message only (not type+message)
- **Impact**: Single trigger now creates only ONE incident/PR instead of two
- **File**: `apps/agent/src/index.ts`

### 2. AI Patch Generation

- **Status**: IMPROVED
- **Change**: Added detailed formatting requirements to AI prompt
- **Impact**: Better patch format compliance, fewer "corrupt patch" errors
- **File**: `apps/autopsy/src/ai_reasoner.ts`
- **Note**: Patches may still fail occasionally - system saves failed patches as `patch_failed_*.diff` for manual review

### 3. Configuration Management

- **Status**: FIXED
- **Change**: Reverted config to PLACEHOLDER values
- **Impact**: Users must configure their own GitHub owner/repo
- **Files**:
  - `aia.config.yaml` - Main config (PLACEHOLDER values)
  - `.gitignore` - Added `aia.config.local.yaml` for local testing
  - `README.md` - Updated with local config instructions

### 4. GitHub Authentication

- **Status**: WORKING
- **Implementation**: Token embedded in clone URL (`https://TOKEN@github.com/...`)
- **Impact**: Successful clone, push, and PR creation

### 5. Dashboard Enhancements

- **Status**: WORKING
- **Features**:
  - AI Fix Prompt (copy-to-clipboard)
  - Manual Fix Steps
  - Repo name, file path, timestamp display
  - Detailed autopsy results

## ⚠️ Known Limitations

### 1. Patch Application

- **Issue**: AI-generated patches sometimes fail to apply
- **Workaround**: Failed patches are saved to the repo as `patch_failed_*.diff`
- **Future**: Consider improving AI patch generation or using alternative fix methods

### 2. Dashboard Data Population

- **Issue**: `repo_name` and `file_path` may not always be populated
- **Depends On**: Router capturing this data from snapshots
- **Status**: Needs verification in production

### 3. AI Prompt Quality

- **Issue**: `fix_prompt` and `manual_steps` quality depends on AI response
- **Status**: Improved with detailed instructions, needs real-world testing

## 📋 Pre-Production Setup

### For Users Deploying This System:

1. **Create GitHub Token**:

   ```bash
   # Go to: https://github.com/settings/tokens
   # Create token with 'repo' scope
   # Copy token (starts with ghp_)
   ```

2. **Configure Environment**:

   ```bash
   # Create .env file
   echo "GITHUB_TOKEN=ghp_your_token_here" > .env
   echo "YOU_API_KEY=ydc_your_key_here" >> .env
   ```

3. **Update Config**:

   ```yaml
   # Edit aia.config.yaml
   github:
     owner: "your-github-username"
     repo: "your-repo-name"
   ```

4. **Test Locally**:
   ```bash
   bun run dev
   # Trigger test incident via Postman
   # Verify PR creation on GitHub
   ```

## 🚀 Production Deployment Checklist

- [ ] GitHub token created with `repo` scope
- [ ] `.env` file configured with `GITHUB_TOKEN` and `YOU_API_KEY`
- [ ] `aia.config.yaml` updated with correct `owner` and `repo`
- [ ] Database connection string configured (if using external DB)
- [ ] R2 storage credentials configured
- [ ] All services start successfully (`bun run dev`)
- [ ] Test incident creates PR successfully
- [ ] Dashboard displays incident details correctly
- [ ] AI fix prompt and manual steps are generated
- [ ] No duplicate PRs created from single trigger

## 📊 Monitoring Recommendations

1. **Watch for**:
   - Duplicate incidents (should be fixed)
   - Failed patch applications (check `patch_failed_*.diff` files)
   - GitHub API rate limits
   - AI API errors

2. **Metrics to Track**:
   - Incident detection rate
   - PR creation success rate
   - Patch application success rate
   - Time from detection to PR creation

## 🔧 Troubleshooting

### Issue: PR Creation Fails with 404

- **Check**: `owner` and `repo` in `aia.config.yaml`
- **Check**: GitHub token has `repo` scope
- **Check**: Token has access to the repository

### Issue: PR Creation Fails with 403

- **Check**: GitHub token permissions
- **Solution**: Regenerate token with `repo` scope

### Issue: Duplicate PRs Created

- **Check**: Agent deduplication logic is using error message only
- **File**: `apps/agent/src/index.ts` line 18

### Issue: Patches Always Fail

- **Check**: AI response format
- **Check**: File paths in patch match actual files
- **Workaround**: Use manual steps from dashboard

## 📝 Next Steps for Production

1. **Set up monitoring** for incident detection and PR creation
2. **Configure alerts** for failed PR creations
3. **Review AI-generated patches** periodically for quality
4. **Gather metrics** on patch application success rate
5. **Consider** implementing automated patch testing before PR creation

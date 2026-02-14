# Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### ✅ Completed

- [x] Dashboard backend migrated to web project
- [x] Project credentials integration (Router + Autopsy)
- [x] Multi-project support
- [x] Modern UI with all features
- [x] Dependencies installed

### 📋 Required Before Production

## 1. Environment Variables

### **Required for All Services:**

```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"

R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="autonomous-incidents"

YOU_API_KEY="your-you-api-key"
AI_MODEL="gpt-4o"

GITHUB_TOKEN="ghp_your_github_token"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

STATE_SERVICE_URL="https://state.yourdomain.com"
ROUTER_SERVICE_URL="https://router.yourdomain.com"
AUTOPSY_SERVICE_URL="https://autopsy.yourdomain.com"
AGENT_SERVICE_URL="https://agent.yourdomain.com"
WEB_URL="https://yourdomain.com"
```

### **Service-Specific Ports (Production):**

```yaml
services:
  state:
    port: 3003
    base_url: "https://state.yourdomain.com"
  router:
    port: 3001
    base_url: "https://router.yourdomain.com"
  autopsy:
    port: 3002
    base_url: "https://autopsy.yourdomain.com"
  agent:
    port: 4318
    base_url: "https://agent.yourdomain.com"
  web:
    port: 3006
    base_url: "https://yourdomain.com"
```

## 2. Database Setup

### **Run Migrations:**

```bash
cd apps/state
npx prisma generate

npx prisma migrate deploy

npx prisma db pull
```

### **Database Schema Verification:**

Ensure these tables exist:

- ✅ `Incident` (id, title, status, created_at, updated_at, etc.)
- ✅ `Project` (id, user_id, name, repo_url, github_token, openai_api_key, etc.)

## 3. R2 Storage Setup

### **Bucket Structure:**

```
autonomous-incidents/
├── incidents/
│   ├── {incident-id}/
│   │   ├── event.json
│   │   ├── snapshot.json
│   │   ├── autopsy.json
│   │   ├── patch.diff
│   │   └── logs/
│   │       ├── pre.txt
│   │       └── post.txt
```

### **CORS Configuration:**

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

## 4. Service Deployment

### **Recommended Architecture:**

```
┌─────────────────┐
│   Cloudflare    │ (CDN + DDoS Protection)
└────────┬────────┘
         │
┌────────▼────────┐
│   Load Balancer │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┬──────────┐
    │         │          │          │          │
┌───▼───┐ ┌──▼──┐  ┌───▼───┐  ┌───▼───┐  ┌──▼──┐
│  Web  │ │State│  │Router │  │Autopsy│  │Agent│
│ :3006 │ │:3003│  │ :3001 │  │ :3002 │  │:4318│
└───────┘ └──┬──┘  └───┬───┘  └───┬───┘  └─────┘
             │         │          │
        ┌────▼─────────▼──────────▼────┐
        │      PostgreSQL Database      │
        └──────────────────────────────┘
```

### **Docker Compose (Production):**

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: autonomous_incidents
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  state:
    build:
      context: .
      dockerfile: apps/state/Dockerfile
    environment:
      DATABASE_URL: ${DATABASE_URL}
      R2_ACCOUNT_ID: ${R2_ACCOUNT_ID}
      R2_ACCESS_KEY_ID: ${R2_ACCESS_KEY_ID}
      R2_SECRET_ACCESS_KEY: ${R2_SECRET_ACCESS_KEY}
    ports:
      - "3003:3003"
    depends_on:
      - postgres
    restart: unless-stopped

  router:
    build:
      context: .
      dockerfile: apps/router/Dockerfile
    environment:
      STATE_SERVICE_URL: http://state:3003
      AUTOPSY_SERVICE_URL: http://autopsy:3002
      R2_ACCOUNT_ID: ${R2_ACCOUNT_ID}
      R2_ACCESS_KEY_ID: ${R2_ACCESS_KEY_ID}
      R2_SECRET_ACCESS_KEY: ${R2_SECRET_ACCESS_KEY}
    ports:
      - "3001:3001"
    depends_on:
      - state
    restart: unless-stopped

  autopsy:
    build:
      context: .
      dockerfile: apps/autopsy/Dockerfile
    environment:
      YOU_API_KEY: ${YOU_API_KEY}
      STATE_SERVICE_URL: http://state:3003
      R2_ACCOUNT_ID: ${R2_ACCOUNT_ID}
      R2_ACCESS_KEY_ID: ${R2_ACCESS_KEY_ID}
      R2_SECRET_ACCESS_KEY: ${R2_SECRET_ACCESS_KEY}
    ports:
      - "3002:3002"
    depends_on:
      - state
    restart: unless-stopped

  agent:
    build:
      context: .
      dockerfile: apps/agent/Dockerfile
    environment:
      ROUTER_SERVICE_URL: http://router:3001
      R2_ACCOUNT_ID: ${R2_ACCOUNT_ID}
      R2_ACCESS_KEY_ID: ${R2_ACCESS_KEY_ID}
      R2_SECRET_ACCESS_KEY: ${R2_SECRET_ACCESS_KEY}
    ports:
      - "4318:4318"
    depends_on:
      - router
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      CLERK_SECRET_KEY: ${CLERK_SECRET_KEY}
      STATE_SERVICE_URL: http://state:3003
      R2_ACCOUNT_ID: ${R2_ACCOUNT_ID}
      R2_ACCESS_KEY_ID: ${R2_ACCESS_KEY_ID}
      R2_SECRET_ACCESS_KEY: ${R2_SECRET_ACCESS_KEY}
    ports:
      - "3006:3006"
    depends_on:
      - state
    restart: unless-stopped

volumes:
  postgres_data:
```

## 5. Security Checklist

### **Before Going Live:**

- [ ] Change all default passwords
- [ ] Enable HTTPS/TLS for all services
- [ ] Set up firewall rules (only expose necessary ports)
- [ ] Enable rate limiting on public endpoints
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy for database
- [ ] Enable audit logging
- [ ] Review and rotate API keys
- [ ] Set up CORS properly
- [ ] Enable CSP headers
- [ ] Configure session timeouts

## 6. Monitoring & Observability

### **Recommended Tools:**

```bash
- Sentry (error tracking)
- Datadog / New Relic (APM)
- Prometheus + Grafana (metrics)

- Cloudflare Analytics
- AWS CloudWatch / DigitalOcean Monitoring

- Loki / ELK Stack
- Papertrail
```

### **Key Metrics to Monitor:**

- API response times
- Error rates per service
- Database query performance
- R2 storage usage
- AI API costs (per project)
- Incident detection rate
- Autopsy success rate

## 7. Deployment Steps

### **Step-by-Step:**

```bash
bun run build

cd apps/state && npx prisma migrate deploy

NODE_ENV=production bun run start

curl https://yourdomain.com/api/health
curl https://state.yourdomain.com/health
curl https://router.yourdomain.com/health
curl https://autopsy.yourdomain.com/health
curl https://agent.yourdomain.com/health

```

## 8. Post-Deployment

### **Immediate Actions:**

1. Monitor logs for errors
2. Test user sign-up flow
3. Create test project
4. Trigger test incident
5. Verify autopsy completes
6. Check PDF generation
7. Verify email notifications (if configured)

### **Within 24 Hours:**

1. Review performance metrics
2. Check error rates
3. Verify backup strategy
4. Test disaster recovery
5. Document any issues
6. Create runbook for common issues

## 9. Rollback Plan

### **If Issues Occur:**

```bash
git revert HEAD
git push

pg_restore -d autonomous_incidents backup.sql

```

## 10. Cleanup

### **Remove Old Dashboard Service:**

```bash
git mv apps/dashboard apps/dashboard-archived
git commit -m "Archive old dashboard service"
```

## 📊 Success Criteria

### **Production is Ready When:**

- ✅ All services start without errors
- ✅ Database migrations complete successfully
- ✅ Users can sign in via Clerk
- ✅ Projects can be created with custom credentials
- ✅ Incidents are detected and processed
- ✅ Autopsy uses project-specific API keys
- ✅ Dashboard displays all incident data
- ✅ PDF reports generate successfully
- ✅ All API endpoints respond < 500ms
- ✅ No memory leaks or crashes for 24 hours
- ✅ Monitoring and alerts are configured
- ✅ Backup strategy is tested

## 🆘 Support & Troubleshooting

### **Common Issues:**

1. **Database connection fails**
   - Check DATABASE_URL format
   - Verify network connectivity
   - Check firewall rules

2. **R2 storage errors**
   - Verify credentials
   - Check bucket permissions
   - Verify CORS configuration

3. **Autopsy fails**
   - Check AI API key
   - Verify API rate limits
   - Check logs for errors

4. **Dashboard not loading**
   - Check Clerk configuration
   - Verify Next.js build
   - Check browser console

---

**Estimated Time to Production: 2-3 hours**

This includes:

- Environment setup (30 min)
- Database migration (15 min)
- Service deployment (45 min)
- Testing (45 min)
- Monitoring setup (30 min)

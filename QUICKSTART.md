# 🚀 Quick Start Guide - Production Deployment

## Prerequisites

Before deploying to production, ensure you have:

- [x] Docker and Docker Compose installed
- [x] PostgreSQL database (or use included Docker Postgres)
- [x] Cloudflare R2 account and bucket
- [x] You.com API key (or OpenAI-compatible API)
- [x] Clerk account for authentication
- [x] GitHub token (optional, for default)

## Step 1: Configure Environment

```bash
cp .env.production.template .env.production

nano .env.production
```

### Required Values:

```bash
DB_PASSWORD=your_secure_password

R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key

YOU_API_KEY=your_api_key

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

## Step 2: Deploy

```bash
./scripts/deploy-production.sh
```

This script will:

1. ✅ Check environment variables
2. ✅ Run database migrations
3. ✅ Build Docker images
4. ✅ Start all services
5. ✅ Verify health checks

## Step 3: Verify Deployment

### Check Service Health:

```bash
curl http://localhost:3003/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:4318/health
curl http://localhost:3006/
```

### View Logs:

```bash
docker-compose -f docker-compose.prod.yml logs -f

docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f state
```

## Step 4: Test the System

### 1. Access Dashboard:

```
Open: http://localhost:3006
```

### 2. Sign Up/Sign In:

- Use Clerk authentication
- Create your account

### 3. Create a Project:

- Click "New Project"
- Enter project details:
  - Name: "My Test App"
  - Repository URL: https://github.com/yourusername/yourrepo
  - GitHub Token: (optional, your token)
  - OpenAI API Key: (optional, your key)
- Click "Create"

### 4. Trigger a Test Incident:

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -d '{
    "resourceSpans": [{
      "resource": {
        "attributes": [{
          "key": "service.name",
          "value": {"stringValue": "test-service"}
        }]
      },
      "scopeSpans": [{
        "spans": [{
          "traceId": "5b8aa5a2d2c872e8321cf37308d69df2",
          "spanId": "051581bf3cb55c13",
          "name": "test-operation",
          "kind": 1,
          "startTimeUnixNano": "1544712660000000000",
          "endTimeUnixNano": "1544712661000000000",
          "status": {
            "code": 2,
            "message": "Test error for incident detection"
          }
        }]
      }]
    }]
  }'
```

### 5. View Incident in Dashboard:

- Go to Dashboard → Incidents
- You should see the test incident
- Check that autopsy analysis completes
- Verify fix prompts and manual steps appear

## Step 5: Production Checklist

Before going live with real traffic:

### Security:

- [ ] Change all default passwords
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Review API key permissions

### Monitoring:

- [ ] Set up error tracking (Sentry)
- [ ] Configure log aggregation
- [ ] Set up uptime monitoring
- [ ] Create alert rules
- [ ] Set up backup strategy

### Performance:

- [ ] Load test the system
- [ ] Optimize database queries
- [ ] Configure caching
- [ ] Set up CDN (if needed)

## Common Commands

### Start Services:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Stop Services:

```bash
docker-compose -f docker-compose.prod.yml down
```

### Restart a Service:

```bash
docker-compose -f docker-compose.prod.yml restart web
```

### View Logs:

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Database Migrations:

```bash
cd apps/state
npx prisma migrate deploy
```

### Rebuild After Code Changes:

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Services Won't Start:

```bash
docker-compose -f docker-compose.prod.yml logs

lsof -ti:3003,3001,3002,4318,3006

docker-compose -f docker-compose.prod.yml restart
```

### Database Connection Issues:

```bash
docker-compose -f docker-compose.prod.yml ps postgres

docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d autonomous_incidents
```

### R2 Storage Errors:

- Verify R2 credentials in .env.production
- Check bucket permissions
- Verify CORS configuration

### Autopsy Not Working:

- Check AI API key is valid
- Verify API rate limits
- Check autopsy logs for errors

## Scaling

### Horizontal Scaling:

```yaml
services:
  autopsy:
    deploy:
      replicas: 3
```

### Vertical Scaling:

```yaml
services:
  autopsy:
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G
```

## Backup & Recovery

### Database Backup:

```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres autonomous_incidents > backup.sql

docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres autonomous_incidents < backup.sql
```

### R2 Backup:

- R2 data is already in cloud storage
- Consider versioning for critical data

## Next Steps

1. **Custom Domain**: Configure your domain to point to the web service
2. **SSL/TLS**: Set up certificates (Let's Encrypt recommended)
3. **Monitoring**: Integrate with your monitoring stack
4. **CI/CD**: Set up automated deployments
5. **Documentation**: Create user guides for your team

## Support

- Documentation: See `PRODUCTION_DEPLOYMENT.md`
- Architecture: See `PROJECT_CREDENTIALS_INTEGRATION.md`
- Migration Details: See `DASHBOARD_MIGRATION.md`

---

**You're ready for production!** 🎉

Follow these steps and you'll have a fully functional autonomous incident management system running in minutes.

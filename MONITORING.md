# Monitoring and Observability Guide

## 📊 Overview

This guide covers monitoring, logging, and observability for AIA in production.

## 🏥 Health Monitoring

### Service Health Endpoints

All services expose `/health` endpoints:

```bash
# State Service
curl http://localhost:3003/health
# Response: {"status":"healthy","database":"connected"}

# Router Service
curl http://localhost:3001/health
# Response: {"status":"healthy","services":{"state":"connected"}}

# Autopsy Service
curl http://localhost:3002/health
# Response: {"status":"healthy","ai_configured":true}

# Agent Service
curl http://localhost:4318/health
# Response: {"status":"healthy"}

# Web Dashboard
curl http://localhost:3006/
# Response: 200 OK
```

### Automated Health Checks

Docker Compose includes health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3003/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Uptime Monitoring

**Recommended Tools:**

- [UptimeRobot](https://uptimerobot.com/) - Free tier available
- [Pingdom](https://www.pingdom.com/)
- [StatusCake](https://www.statuscake.com/)
- [Better Uptime](https://betteruptime.com/)

**Setup:**

1. Monitor all 5 service endpoints
2. Set check interval to 1-5 minutes
3. Configure alerts (email, Slack, SMS)
4. Create status page for users

## 📝 Logging

### Log Levels

Services use structured logging:

- `ERROR` - Critical errors requiring attention
- `WARN` - Warning conditions
- `INFO` - General information
- `DEBUG` - Detailed debugging (dev only)

### Viewing Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f state

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100

# Since timestamp
docker-compose -f docker-compose.prod.yml logs --since 2024-01-01T00:00:00
```

### Log Aggregation

**Recommended Solutions:**

#### 1. Loki + Grafana (Free, Self-hosted)

```yaml
# Add to docker-compose.prod.yml
loki:
  image: grafana/loki:latest
  ports:
    - "3100:3100"
  volumes:
    - loki_data:/loki

grafana:
  image: grafana/grafana:latest
  ports:
    - "3000:3000"
  volumes:
    - grafana_data:/var/lib/grafana
```

#### 2. Papertrail (Managed, Free Tier)

```bash
# Install remote_syslog2
wget https://github.com/papertrail/remote_syslog2/releases/download/v0.20/remote_syslog_linux_amd64.tar.gz
tar xzf remote_syslog*.tar.gz
cd remote_syslog
sudo cp remote_syslog /usr/local/bin

# Configure
cat > /etc/log_files.yml <<EOF
files:
  - /var/lib/docker/containers/*/*.log
destination:
  host: logs.papertrailapp.com
  port: YOUR_PORT
  protocol: tls
EOF

# Start
sudo remote_syslog
```

#### 3. ELK Stack (Self-hosted)

- Elasticsearch for storage
- Logstash for processing
- Kibana for visualization

### Log Retention

**Recommended Policy:**

- **Hot logs**: 7 days (fast access)
- **Warm logs**: 30 days (slower access)
- **Cold logs**: 90 days (archive)
- **Delete**: After 90 days

## 🔍 Error Tracking

### Sentry Integration

**Setup:**

1. Create Sentry account at [sentry.io](https://sentry.io)

2. Add to each service:

```typescript
// apps/state/src/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Capture errors
try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

3. Add environment variables:

```bash
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

**Benefits:**

- Automatic error grouping
- Stack traces with source maps
- Release tracking
- Performance monitoring
- Alert notifications

## 📈 Metrics & Performance

### Key Metrics to Track

#### Service Metrics

- **Request Rate**: Requests per second
- **Error Rate**: Errors per second / total requests
- **Response Time**: p50, p95, p99 latency
- **Availability**: Uptime percentage

#### Business Metrics

- **Incidents Detected**: Count per hour/day
- **Autopsy Success Rate**: Successful analyses / total
- **Active Projects**: Total projects
- **Active Users**: Daily/monthly active users

#### Infrastructure Metrics

- **CPU Usage**: Per service
- **Memory Usage**: Per service
- **Disk Usage**: Database and logs
- **Network I/O**: Bandwidth usage

### Prometheus + Grafana

**Setup:**

1. Add Prometheus to docker-compose:

```yaml
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
  command:
    - "--config.file=/etc/prometheus/prometheus.yml"
```

2. Create `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "aia-services"
    static_configs:
      - targets:
          - "state:3003"
          - "router:3001"
          - "autopsy:3002"
          - "agent:4318"
```

3. Add Grafana dashboards for visualization

### Application Performance Monitoring (APM)

**Recommended Tools:**

#### 1. Datadog (Managed)

- Full-stack observability
- APM, logs, metrics in one place
- AI-powered insights
- Free tier available

#### 2. New Relic (Managed)

- Application monitoring
- Infrastructure monitoring
- Browser monitoring
- Free tier: 100GB/month

#### 3. Elastic APM (Self-hosted)

- Part of ELK stack
- Open source
- Distributed tracing

## 🚨 Alerting

### Alert Rules

**Critical Alerts** (Immediate notification):

- Any service down > 2 minutes
- Error rate > 5%
- Database connection lost
- Disk usage > 90%
- Memory usage > 90%

**Warning Alerts** (Review within 1 hour):

- Response time > 1s (p95)
- Error rate > 1%
- CPU usage > 80%
- Memory usage > 80%

**Info Alerts** (Review daily):

- Unusual traffic patterns
- High AI API costs
- Slow database queries

### Alert Channels

**Recommended Setup:**

- **Critical**: PagerDuty/OpsGenie + SMS
- **Warning**: Slack/Discord
- **Info**: Email digest

### Example Alert Configuration

**Prometheus Alert Rules:**

```yaml
groups:
  - name: aia_alerts
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate on {{ $labels.service }}"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High response time on {{ $labels.service }}"
```

## 📊 Dashboards

### Grafana Dashboard Layout

**1. Overview Dashboard**

- Service status (up/down)
- Request rate (all services)
- Error rate (all services)
- Response times (p50, p95, p99)

**2. Service-Specific Dashboards**

- Per-service metrics
- Database query performance
- API call distribution
- Resource usage

**3. Business Metrics Dashboard**

- Incidents per day
- Autopsy success rate
- Active users
- Project count

**4. Infrastructure Dashboard**

- CPU usage per service
- Memory usage per service
- Disk I/O
- Network traffic

### Pre-built Dashboards

Import these Grafana dashboard IDs:

- **Docker Monitoring**: 893
- **Node Exporter**: 1860
- **PostgreSQL**: 9628

## 🔐 Audit Logging

### What to Log

**User Actions:**

- Sign in/sign out
- Project creation/deletion
- Credential updates
- Settings changes

**System Events:**

- Incident detection
- Autopsy completion
- PDF generation
- API calls

**Security Events:**

- Failed authentication
- Invalid API keys
- Unusual access patterns
- Rate limit hits

### Audit Log Format

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "event": "project.created",
  "user_id": "user_123",
  "project_id": "proj_456",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "metadata": {
    "project_name": "My App"
  }
}
```

### Audit Log Storage

- Store in separate database table
- Retention: 1 year minimum
- Immutable (append-only)
- Regular backups
- Encrypted at rest

## 📱 Status Page

### Public Status Page

**Options:**

1. **Statuspage.io** (Atlassian) - Managed
2. **Cachet** - Self-hosted, open source
3. **Upptime** - GitHub Actions based

**Components to Monitor:**

- Dashboard
- API Services
- Database
- Storage (R2)
- Authentication (Clerk)

**Incident Communication:**

- Real-time status updates
- Incident timeline
- Maintenance schedules
- Subscribe to notifications

## 🎯 SLOs and SLIs

### Service Level Objectives

**Availability:**

- Target: 99.9% uptime (43 minutes downtime/month)
- Measurement: Health check success rate

**Performance:**

- Target: 95% of requests < 500ms
- Measurement: p95 response time

**Reliability:**

- Target: < 0.1% error rate
- Measurement: 5xx errors / total requests

### Service Level Indicators

Track these metrics:

- **Uptime**: Percentage of time service is available
- **Latency**: Response time distribution
- **Throughput**: Requests per second
- **Error Rate**: Failed requests percentage

## 📋 Monitoring Checklist

### Initial Setup

- [ ] Configure health checks
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation
- [ ] Set up error tracking (Sentry)
- [ ] Configure metrics collection
- [ ] Create Grafana dashboards
- [ ] Set up alert rules
- [ ] Configure alert channels
- [ ] Create status page
- [ ] Enable audit logging

### Daily Tasks

- [ ] Review error rates
- [ ] Check service health
- [ ] Review alerts
- [ ] Check resource usage

### Weekly Tasks

- [ ] Review performance trends
- [ ] Analyze slow queries
- [ ] Review audit logs
- [ ] Check backup status
- [ ] Review security events

### Monthly Tasks

- [ ] Review SLO compliance
- [ ] Analyze cost trends
- [ ] Update dashboards
- [ ] Review retention policies
- [ ] Capacity planning

## 🔧 Troubleshooting

### High Memory Usage

```bash
# Check container stats
docker stats

# Inspect specific service
docker-compose -f docker-compose.prod.yml exec state sh
ps aux
top
```

### Slow Queries

```sql
-- PostgreSQL slow query log
SELECT * FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### High CPU Usage

```bash
# Profile Node.js app
node --prof app.js

# Analyze profile
node --prof-process isolate-*.log > processed.txt
```

## 📞 Support

For monitoring issues:

- Check service logs first
- Review Grafana dashboards
- Check alert history
- Contact support with metrics

---

**Last Updated**: 2026-02-15  
**Version**: 1.0.0

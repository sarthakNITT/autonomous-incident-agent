# Security Policy

## 🔒 Security Overview

AIA (Autonomous Incident Agent) takes security seriously. This document outlines our security practices, vulnerability reporting process, and security considerations for deployment.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | Yes       |
| < 1.0   | No        |

## Security Features

### Authentication & Authorization

- **Clerk Authentication** - Industry-standard OAuth2/OIDC
- **Session Management** - Secure, httpOnly cookies
- **Multi-tenancy** - User isolation at database level
- **API Key Encryption** - Project credentials encrypted at rest

### Data Protection

- **Encryption at Rest** - Database credentials encrypted
- **Encryption in Transit** - HTTPS/TLS required in production
- **Credential Isolation** - Per-project API keys stored securely
- **No Credential Logging** - Sensitive data excluded from logs

### Infrastructure Security

- **Docker Isolation** - Containerized services with network isolation
- **Health Checks** - Automated service monitoring
- **Restart Policies** - Automatic recovery from failures
- **Resource Limits** - Prevent resource exhaustion attacks

### API Security

- **CORS Configuration** - Strict origin policies
- **Input Validation** - All inputs sanitized
- **Rate Limiting** - Protection against abuse (recommended)
- **Error Handling** - No sensitive data in error messages

## Security Checklist for Production

### Before Deployment

- [ ] **Change all default passwords**

  ```bash
  # Generate secure passwords
  openssl rand -base64 32
  ```

- [ ] **Enable HTTPS/TLS**
  - Use Let's Encrypt or commercial SSL certificate
  - Configure reverse proxy (nginx/Caddy)
  - Enforce HTTPS redirects

- [ ] **Configure Firewall**

  ```bash
  # Only expose necessary ports
  - 443 (HTTPS)
  - 4318 (OTel - from trusted sources only)
  ```

- [ ] **Set up Environment Variables Securely**
  - Never commit `.env.production` to git
  - Use secrets management (AWS Secrets Manager, HashiCorp Vault)
  - Rotate credentials regularly

- [ ] **Database Security**
  - Use strong passwords (32+ characters)
  - Enable SSL/TLS for database connections
  - Restrict database access to application network only
  - Regular backups with encryption

- [ ] **R2/Storage Security**
  - Use IAM roles with minimal permissions
  - Enable bucket versioning
  - Configure CORS restrictively
  - Enable access logging

- [ ] **Enable Security Headers**

  ```nginx
  # Add to nginx/reverse proxy
  add_header X-Frame-Options "SAMEORIGIN";
  add_header X-Content-Type-Options "nosniff";
  add_header X-XSS-Protection "1; mode=block";
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
  add_header Content-Security-Policy "default-src 'self'";
  ```

- [ ] **Rate Limiting**

  ```nginx
  # Example nginx rate limiting
  limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
  limit_req zone=api burst=20 nodelay;
  ```

- [ ] **Monitoring & Alerting**
  - Set up error tracking (Sentry)
  - Configure uptime monitoring
  - Enable audit logging
  - Alert on suspicious activities

- [ ] **Backup Strategy**
  - Automated daily database backups
  - Test restore procedures
  - Off-site backup storage
  - Encryption for backup files

### Post-Deployment

- [ ] **Security Audit**
  - Review all exposed endpoints
  - Test authentication flows
  - Verify credential isolation
  - Check for information disclosure

- [ ] **Penetration Testing**
  - Test for common vulnerabilities (OWASP Top 10)
  - Verify input validation
  - Test rate limiting
  - Check session management

- [ ] **Dependency Scanning**

  ```bash
  # Run dependency audit
  bun audit
  npm audit
  ```

- [ ] **Log Review**
  - Monitor for failed authentication attempts
  - Check for unusual API usage patterns
  - Review error rates
  - Audit database access

## Vulnerability Reporting

### Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **DO NOT** open a public GitHub issue
2. Email security details to: **security@yourdomain.com** (replace with actual email)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **24 hours**: Initial acknowledgment
- **72 hours**: Preliminary assessment
- **7 days**: Detailed response with timeline
- **30 days**: Fix deployed (for critical issues)

### Disclosure Policy

- We follow responsible disclosure practices
- Security fixes are prioritized
- Public disclosure after fix is deployed
- Credit given to reporters (unless requested otherwise)

## Known Security Considerations

### 1. API Key Storage

- Project API keys are stored encrypted in the database
- Encryption key must be securely managed
- Consider using external secrets management in production

### 2. OpenTelemetry Endpoint

- Port 4318 receives telemetry from user applications
- Implement network-level restrictions
- Consider mutual TLS for production

### 3. AI API Costs

- Users provide their own API keys
- Implement usage monitoring to prevent abuse
- Consider rate limiting per project

### 4. Code Snapshot Storage

- Snapshots may contain sensitive code
- Ensure R2 bucket is private
- Implement retention policies
- Consider encryption for snapshots

### 5. PDF Generation

- PDF reports may contain sensitive information
- Ensure proper access controls
- Consider watermarking
- Implement download logging

## Security Best Practices for Users

### For Application Owners

1. **Protect Your API Keys**
   - Never commit API keys to git
   - Rotate keys regularly
   - Use separate keys for dev/prod

2. **Monitor Your Projects**
   - Review incident reports regularly
   - Check for unusual activity
   - Audit AI API usage

3. **Secure Your Repository**
   - Use GitHub's security features
   - Enable branch protection
   - Review dependency alerts

### For Developers

1. **Code Review**
   - Review all changes before deployment
   - Check for hardcoded credentials
   - Validate input handling

2. **Dependency Management**
   - Keep dependencies updated
   - Review security advisories
   - Use lock files

3. **Testing**
   - Test authentication flows
   - Verify authorization checks
   - Test error handling

## Compliance

### Data Privacy

- User data is isolated per account
- No cross-tenant data access
- Audit logging for compliance
- Data retention policies configurable

### GDPR Considerations

- User data can be exported
- Account deletion supported
- Data processing documented
- Privacy policy required

## Security Updates

Security updates are released as needed:

- **Critical**: Immediate patch release
- **High**: Within 7 days
- **Medium**: Next minor version
- **Low**: Next major version

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
- [Cloudflare R2 Security](https://developers.cloudflare.com/r2/security/)

## Contact

For security concerns:

- Email: security@yourdomain.com
- GitHub Security Advisories: [Enable in repository settings]

---

**Last Updated**: 2026-02-15  
**Version**: 1.0.0

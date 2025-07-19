# Security Policy

## Security Features Implemented

### 🛡️ Server Security

- **CORS Protection**: Properly configured Cross-Origin Resource Sharing
- **Security Headers**: 
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Rate Limiting**: 100 requests per 15-minute window per IP
- **Input Validation**: All API endpoints validate input data
- **SQL Injection Protection**: Parameterized queries used throughout
- **Request Size Limits**: Body size limited to 10MB
- **Error Handling**: Proper error handling without information disclosure

### 🔒 Data Security

- **Database**: SQLite with parameterized queries
- **Data Persistence**: Database files excluded from version control
- **Input Sanitization**: All user inputs are validated and sanitized

### 🚀 Deployment Security

- **Environment Variables**: Sensitive configuration via environment variables
- **Docker Security**: Non-root user execution in containers
- **Production Configuration**: Secure defaults for production deployment

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Required Variables for Production:

- `NODE_ENV=production`
- `ALLOWED_ORIGINS`: Your production domain(s)
- `PORT`: Server port (default: 5000)

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please:

1. **Do not** open a public GitHub issue
2. Email the maintainer privately with details
3. Allow time for the issue to be addressed before public disclosure

## Security Checklist for Deployment

- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Use HTTPS in production
- [ ] Set up proper firewall rules
- [ ] Regular dependency updates
- [ ] Monitor application logs
- [ ] Backup database regularly

## Dependencies Security

Regular security audits should be performed:

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Docker Security

The application uses multi-stage Docker builds and runs as non-root user for enhanced security. 
# Security Implementation Guide

## Overview
This document outlines the security measures implemented throughout the Inventory Management System to protect against common vulnerabilities including:
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Cross-Site Scripting (XSS)**: Input sanitization and output encoding
- **SQL Injection**: Input validation and parameterized queries (where applicable)
- **Data Encryption**: Encryption of sensitive data in storage
- **Rate Limiting**: Protection against brute force and DDoS attacks
- **Security Headers**: HTTP security headers for defense-in-depth

---

## Backend Security

### 1. Authentication & Authorization

#### Location: `backend/middleware/auth.js`

**Features:**
- JWT (JSON Web Token) based authentication
- Role-based access control (RBAC) with 4 roles:
  - `super_admin`: Full system access
  - `admin`: Most features, limited user management
  - `user`: Standard operations
  - `viewer`: Read-only access

**Implementation:**
```javascript
// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // Validate and attach user to request
  });
};

// Authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
  };
};
```

**Best Practices:**
- JWT tokens expire in 24 hours
- Tokens are verified on every authenticated request
- Passwords are never included in token payload
- Case-insensitive username/email lookup for consistency

### 2. Input Validation & Sanitization

#### Location: `backend/middleware/auth.js`

**Features:**
- Regex-based validation for usernames, emails, passwords
- HTML/XSS character escaping:
  - `<` → `&lt;`
  - `>` → `&gt;`
  - `"` → `&quot;`
  - `'` → `&#x27;`
- Input length limiting (max 500 characters per field)
- Automatic trimming and type checking

**Implementation:**
```javascript
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>\"']/g, (char) => htmlEntityMap[char])
    .trim()
    .slice(0, 500); // Limit length
};
```

**Applied To:**
- All POST/PUT/PATCH request bodies via `validateAndSanitize` middleware
- Login credentials
- User creation parameters
- Data entry fields in repairs, transactions, suppliers

### 3. Encryption

#### Location: `backend/utils/encryption.js`

**Algorithm:** AES-256-GCM (Galois/Counter Mode)
- 256-bit encryption key (derived from master key via SHA-256)
- 12-byte random IV (Initialization Vector) per encryption
- 16-byte authentication tag for integrity verification

**Features:**
- Automatic random IV generation for each encryption
- Authentication tag prevents tampering
- Supports both string and object encryption (auto JSON serialization)
- One-way hashing for verification

**Usage:**
```javascript
const encryptionWrapper = require('./utils/encryption');

// Encrypt sensitive data
const encrypted = encryptionWrapper.encrypt({ token: '...' });

// Decrypt
const decrypted = encryptionWrapper.decrypt(encrypted);

// Hash (one-way, for verification)
const hash = encryptionWrapper.hash(sensitiveData);
```

**Note:** Currently sensitive data in memory is not encrypted, but the infrastructure is in place for future database integration.

### 4. Password Security

**Implementation:**
- Bcrypt hashing with 12 salt rounds (industry standard)
- Passwords never stored in plain text
- Passwords never transmitted in responses
- Constant-time comparison using bcrypt.compare()

```javascript
const hashed = await bcrypt.hash(password, 12); // 12 salt rounds
const isValid = await bcrypt.compare(inputPassword, hashed);
```

### 5. HTTP Security Headers

#### Location: `backend/middleware/auth.js`

**Headers Added:**
```
X-Content-Type-Options: nosniff          // Prevent MIME sniffing
X-Frame-Options: DENY                    // Prevent clickjacking
X-XSS-Protection: 1; mode=block          // Enable browser XSS protection
Strict-Transport-Security: max-age=...   // Force HTTPS
Content-Security-Policy: default-src 'self' // Restrict script sources
Referrer-Policy: strict-origin-when-cross-origin
```

Also uses **Helmet.js** for automatic header injection.

### 6. Rate Limiting

#### Location: `backend/server.js`

**Configuration:**
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,                    // Only 5 login attempts
  skipSuccessfulRequests: true,
});
```

**Applied To:**
- All routes: General rate limiting (100 req/15min)
- Login route: Stricter limit (5 attempts/15min)

### 7. CORS Configuration

#### Location: `backend/server.js`

**Security Options:**
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

**Restrictions:**
- Only specified origin allowed (configure via `FRONTEND_URL` env var)
- Credentials must be explicitly requested
- Preflight requests handled automatically

### 8. Password Requirements

**User Creation (`POST /api/auth/users`):**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

---

## Frontend Security

### 1. Encrypted Storage

#### Location: `frontend/src/utils/encryption.ts`

**Implementation:**
- Simple XOR encryption for frontend (for demo purposes)
- **IMPORTANT**: For production, use TweetNaCl.js or libsodium
- Random 16-character IV per encryption
- Base64 encoding for storage

**What Gets Encrypted:**
- `auth_token`: JWT authentication token
- `auth_user`: User profile information

**What's NOT Encrypted (safe):**
- `repairFilter`: User's selected filter (not sensitive)

**Usage:**
```typescript
import encryptionWrapper from '@/utils/encryption';

// Encrypt
const encrypted = encryptionWrapper.encrypt(sensitiveData);
localStorage.setItem('key', encrypted);

// Decrypt
const decrypted = encryptionWrapper.decrypt(encrypted);

// Clear sensitive data
encryptionWrapper.clearSensitiveData(password);
```

### 2. Input Sanitization

#### Location: `frontend/src/context/AuthContext.tsx`

**Applied To:**
- Username input: Trimmed to 100 characters
- Password input: Validated on backend
- All form inputs: Sanitized before submission

**XSS Prevention:**
- React's built-in XSS protection (auto-escapes JSX)
- No use of `dangerouslySetInnerHTML`
- No eval() or similar dangerous functions
- Content Security Policy headers from backend

### 3. Secure API Requests

**Axios Configuration:**
```typescript
// Authorization header automatically added
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// HTTPS enforced in production
// Credentials only sent to same-origin (CORS)
```

### 4. Session Management

**Features:**
- Automatic token restoration on app reload from encrypted storage
- Token validation happens on backend (not just frontend)
- Logout clears all encrypted storage
- No tokens in URLs (always in headers)

**On Logout:**
- Token cleared from state
- Encrypted storage cleared
- Authorization header removed
- User redirected to login

---

## Environment Configuration

### Required Environment Variables

**Backend (`.env`):**
```
JWT_SECRET=your-very-secure-random-secret-key-min-32-chars
ENCRYPTION_KEY=your-encryption-master-key-min-32-chars
FRONTEND_URL=http://localhost:3000
NODE_ENV=production
PORT=5000
```

**Frontend (`.env.local`):**
```
REACT_APP_ENCRYPTION_KEY=frontend-encryption-key
```

### Security Checklist for Deployment

- [ ] Change all default secrets to strong, random values (32+ chars)
- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Configure database connection with prepared statements
- [ ] Set up database encryption
- [ ] Enable database access logs
- [ ] Set up firewall rules
- [ ] Configure rate limiting thresholds for your traffic
- [ ] Set up security monitoring/logging
- [ ] Regular security updates for dependencies (`npm audit fix`)
- [ ] Regular backups with encryption
- [ ] Implement database query logging

---

## Common Vulnerabilities & Mitigations

### XSS (Cross-Site Scripting)
**Threats:**
- Malicious scripts injected into DOM
- Session hijacking via stolen tokens
- Unauthorized actions on behalf of users

**Mitigations Implemented:**
✅ Input sanitization (HTML entity encoding)  
✅ React's automatic JSX escaping  
✅ Content-Security-Policy headers  
✅ X-XSS-Protection headers  
✅ No use of `innerHTML` or `dangerouslySetInnerHTML`  
✅ Encrypted sensitive data in storage  

### SQL Injection
**Threats:**
- Unauthorized database access
- Data theft or manipulation
- System compromise

**Mitigations Implemented:**
✅ Input validation with regex patterns  
✅ Input length limits  
✅ Type checking on all inputs  
✅ Currently using mock data (no SQL queries)  
✅ **When using real database**: Use parameterized queries/prepared statements

### CSRF (Cross-Site Request Forgery)
**Threats:**
- Unauthorized state-changing operations
- Acting on user's behalf

**Mitigations Implemented:**
✅ JWT token-based auth (not cookie-based)  
✅ Stateless requests  
✅ CORS restrictions  

### Authentication Bypass
**Threats:**
- Unauthorized access to protected resources
- Privilege escalation

**Mitigations Implemented:**
✅ JWT verification on every request  
✅ Role-based authorization checks  
✅ Proper HTTP status codes (401 vs 403)  
✅ No sensitive data in tokens  

### Brute Force Attacks
**Threats:**
- Password cracking
- Account takeover

**Mitigations Implemented:**
✅ Rate limiting on login (5 attempts/15 min)  
✅ Bcrypt hashing (slow, computationally expensive)  
✅ 12 salt rounds (expensive iterations)  
✅ Generic error messages (don't reveal if username exists)  

### Information Disclosure
**Threats:**
- Exposure of sensitive data
- System architecture details

**Mitigations Implemented:**
✅ Encrypted storage for sensitive data  
✅ Passwords never in responses  
✅ Error messages don't reveal details  
✅ Stack traces only in development mode  

---

## Testing & Validation

### Running Security Tests
```bash
# Frontend tests
cd frontend
npm test -- --watchAll=false

# Audit dependencies
npm audit

# Build production version
npm run build
```

### Recommended Security Testing Tools
- **OWASP ZAP**: Free security scanning
- **Burp Suite**: Professional penetration testing
- **npm audit**: Dependency vulnerability scanning
- **SonarQube**: Code quality and security analysis

---

## Logging & Monitoring

### What to Monitor
- Failed authentication attempts
- Authorization failures
- Unusual API access patterns
- High rate limit triggers
- Error rates and stack traces

### Recommended Tools
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**: Enterprise logging
- **New Relic**: Application monitoring
- **Datadog**: Infrastructure monitoring

---

## Regular Maintenance

### Weekly
- [ ] Check dependency updates: `npm outdated`
- [ ] Review application logs for anomalies

### Monthly
- [ ] Run `npm audit` and apply patches
- [ ] Review and rotate encryption keys
- [ ] Test disaster recovery procedures
- [ ] Security training for team

### Quarterly
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Policy review and updates

---

## Incident Response

### If a breach is suspected:
1. **Immediately** revoke all active JWT tokens
2. Force password resets for all users
3. Rotate encryption keys
4. Review access logs for compromised accounts
5. Notify affected users
6. Implement additional monitoring
7. Conduct security audit

---

## Additional Security Recommendations

### Short Term (Implement ASAP)
- [ ] Set strong, unique environment variables
- [ ] Enable HTTPS/SSL
- [ ] Configure production CORS properly
- [ ] Set up database access controls

### Medium Term (Implement within 3 months)
- [ ] Implement real database with encryption
- [ ] Add two-factor authentication (2FA)
- [ ] Set up comprehensive logging
- [ ] Regular security audits

### Long Term (Implement within 6-12 months)
- [ ] Implement single sign-on (SSO)
- [ ] Add audit trails for all actions
- [ ] Implement data anonymization for backups
- [ ] ISO 27001 compliance (if required)

---

## References & Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)

---

## Support & Questions

For security concerns or questions, please contact the security team.
This document should be reviewed and updated regularly as the application evolves.

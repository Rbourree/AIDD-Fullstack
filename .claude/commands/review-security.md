---
description: Perform security review focused on multi-tenant isolation
---

Conduct a comprehensive security review of the multi-tenant architecture.

**Review Checklist**:

**1. Tenant Isolation**
- [ ] All queries filter by tenantId from JWT context
- [ ] No direct tenant ID manipulation in request bodies
- [ ] Repository methods enforce tenant filtering
- [ ] TypeORM relations properly cascade tenant constraints
- [ ] TenantFilterInterceptor correctly extracts tenant context

**2. Authorization**
- [ ] JwtAuthGuard applied to all protected routes
- [ ] TenantRoleGuard validates user roles per tenant
- [ ] Role hierarchy respected (OWNER > ADMIN > MEMBER)
- [ ] Invitation acceptance validates tenant access
- [ ] No privilege escalation vulnerabilities

**3. Authentication**
- [ ] Keycloak tokens properly validated via JWKS
- [ ] No JWT token generation in API code
- [ ] Token expiration properly handled
- [ ] Refresh flow through Keycloak only
- [ ] User synchronization secure

**4. Data Leakage Prevention**
- [ ] Cross-tenant data access prevented
- [ ] Error messages don't leak sensitive info
- [ ] Tenant IDs not enumerable
- [ ] Proper input validation on all endpoints
- [ ] No SQL injection vulnerabilities

**5. Configuration Security**
- [ ] .env files properly gitignored
- [ ] Secrets not hardcoded
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled

Should I perform a detailed code analysis for each category?

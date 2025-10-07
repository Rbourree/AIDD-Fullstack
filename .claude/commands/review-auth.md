---
description: Review pure Keycloak authentication implementation
---

Review the authentication implementation to ensure pure Keycloak architecture.

**Pure Keycloak Architecture Checklist**:

**1. Token Generation (Must be NONE in API)**
- [ ] No JwtModule.register() in AuthModule
- [ ] No jwt.sign() calls in codebase
- [ ] No JWT_SECRET or REFRESH_TOKEN_SECRET in config
- [ ] No token generation in AuthService
- [ ] No /auth/refresh endpoint in API

**2. Token Validation (Must be Keycloak-only)**
- [ ] KeycloakJwtStrategy properly configured
- [ ] JWKS URI pointing to Keycloak
- [ ] Token validation using passport-jwt
- [ ] User synchronization from Keycloak JWT
- [ ] No local JWT strategy

**3. Authentication Endpoints**
- [ ] No /auth/login endpoint (should be Keycloak redirect)
- [ ] No /auth/logout in API (should be Keycloak logout)
- [ ] No /auth/refresh in API (should use Keycloak refresh)
- [ ] /auth/me endpoint validates Keycloak token
- [ ] Invitation acceptance doesn't generate tokens

**4. User Management**
- [ ] Users synced from Keycloak on first login
- [ ] keycloakId field properly populated
- [ ] Email synchronized from Keycloak
- [ ] No password field in User entity
- [ ] KeycloakAdminService used for user management

**5. Frontend Integration**
- [ ] Frontend uses Keycloak JS adapter
- [ ] Login redirects to Keycloak
- [ ] Tokens managed by Keycloak client library
- [ ] Token refresh handled by Keycloak
- [ ] Logout calls Keycloak logout endpoint

Should I perform a detailed code scan to verify pure Keycloak implementation?

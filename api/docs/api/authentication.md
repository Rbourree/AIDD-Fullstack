# Authentication API

Authentication endpoints for the **Pure Keycloak architecture**.

**⚠️ IMPORTANT**: The API does NOT provide `/auth/login`, `/auth/register`, `/auth/refresh`, or `/auth/logout` endpoints. All authentication is handled by Keycloak.

## Endpoints

### POST /auth/accept-invitation

Accept an invitation to join a tenant.

**Authentication**: Not required (public endpoint)

**Request Body**:
```json
{
  "token": "invitation-uuid"
}
```

**Response (200)**:
```json
{
  "message": "Invitation accepted successfully. Please log in via Keycloak to access the tenant.",
  "user": {
    "email": "user@example.com",
    "firstName": null,
    "lastName": null
  },
  "tenant": {
    "id": "tenant-uuid",
    "name": "Company Name"
  },
  "role": "MEMBER",
  "redirectToKeycloak": true,
  "keycloakLoginHint": "user@example.com"
}
```

**Errors**:
- `400 Bad Request` - Invalid or expired invitation token
- `400 Bad Request` - Invitation already accepted

**Usage Notes**:
- Creates a minimal user record in the local database if user doesn't exist
- Links the user to the tenant with the specified role
- User must then authenticate via Keycloak to receive JWT tokens
- Frontend should redirect user to Keycloak login after successful acceptance

**Example**:
```bash
curl -X POST http://localhost:3000/auth/accept-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "token": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

---

### POST /auth/reset-password

Trigger Keycloak to send a password reset email.

**Authentication**: Not required (public endpoint)

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response (200)**:
```json
{
  "message": "If a user with this email exists, a password reset email has been sent."
}
```

**Errors**:
- None (always returns success to prevent user enumeration)

**Usage Notes**:
- Delegates password reset to Keycloak Admin API
- Always returns success message (doesn't reveal if user exists)
- Only works for users linked to Keycloak (have `keycloakId`)
- Password reset email is sent by Keycloak (not the API)

**Example**:
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

---

### GET /auth/me

Get current user profile and tenant memberships.

**Authentication**: Required (Keycloak JWT token)

**Headers**:
```
Authorization: Bearer {keycloak-jwt-token}
```

**Response (200)**:
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "keycloakId": "keycloak-user-uuid",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "currentTenantId": "active-tenant-uuid",
  "tenants": [
    {
      "id": "tenant-1-uuid",
      "name": "Company A",
      "role": "OWNER"
    },
    {
      "id": "tenant-2-uuid",
      "name": "Company B",
      "role": "MEMBER"
    }
  ]
}
```

**Errors**:
- `401 Unauthorized` - Missing or invalid Keycloak JWT token
- `401 Unauthorized` - Token signature verification failed
- `401 Unauthorized` - User no longer exists or access revoked

**Usage Notes**:
- Returns the currently authenticated user from Keycloak JWT
- Lists all tenants the user has access to with their roles
- User is automatically synced from Keycloak token claims on each request

**Example**:
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI..."
```

---

## Authentication via Keycloak

### Login Flow

To authenticate users, redirect them to Keycloak:

```javascript
// Frontend: Redirect to Keycloak login
const keycloakUrl = 'http://localhost:8090';
const realm = 'mylegitech';
const clientId = 'mylegitech-frontend';
const redirectUri = 'http://localhost:5173/callback';

const loginUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?` +
  `client_id=${clientId}&` +
  `redirect_uri=${redirectUri}&` +
  `response_type=code&` +
  `scope=openid`;

window.location.href = loginUrl;
```

**Process**:
1. User clicks "Login" in frontend
2. Frontend redirects to Keycloak login page
3. User enters credentials in Keycloak
4. Keycloak validates credentials
5. Keycloak redirects back with authorization code
6. Frontend exchanges code for JWT tokens
7. Frontend uses access token for API requests

### Token Refresh

Refresh tokens via Keycloak's token endpoint:

```bash
curl -X POST 'http://localhost:8090/realms/mylegitech/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=refresh_token' \
  -d 'client_id=mylegitech-frontend' \
  -d 'refresh_token={refresh-token}'
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "token_type": "Bearer"
}
```

### Logout

Logout via Keycloak:

```javascript
// Frontend: Redirect to Keycloak logout
const logoutUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout?` +
  `redirect_uri=${redirectUri}`;

window.location.href = logoutUrl;
```

---

## Using JWT Tokens with the API

All protected endpoints require a valid Keycloak JWT token in the `Authorization` header:

```bash
Authorization: Bearer {keycloak-access-token}
```

**Example API Request**:
```bash
curl -X GET http://localhost:3000/tenants \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI..."
```

**Token Validation**:
- API validates token signature using Keycloak's JWKS endpoint
- Verifies token issuer and audience
- Syncs user data from token claims to local database
- Checks user's access to the specified tenant

---

## Frontend Integration

### Using @react-keycloak/web

```typescript
import { ReactKeycloakProvider } from '@react-keycloak/web';
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8090',
  realm: 'mylegitech',
  clientId: 'mylegitech-frontend',
});

function App() {
  return (
    <ReactKeycloakProvider authClient={keycloak}>
      <YourApp />
    </ReactKeycloakProvider>
  );
}
```

### Making Authenticated Requests

```typescript
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';

function MyComponent() {
  const { keycloak } = useKeycloak();

  const fetchData = async () => {
    const response = await axios.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
    });
    return response.data;
  };

  return <div>...</div>;
}
```

---

## Endpoints NOT Available

The following endpoints **do NOT exist** in this Pure Keycloak architecture:

- ❌ `POST /auth/register` - Use Keycloak user registration or invitation system
- ❌ `POST /auth/login` - Use Keycloak's login page
- ❌ `POST /auth/refresh` - Use Keycloak's token refresh endpoint
- ❌ `POST /auth/logout` - Use Keycloak's logout endpoint

For user onboarding, use the **invitation system**:
1. Admin creates invitation: `POST /tenants/{tenantId}/invitations`
2. User accepts invitation: `POST /auth/accept-invitation`
3. User logs in via Keycloak to receive JWT tokens

---

## Related Documentation

- [Authentication Architecture](../architecture/authentication.md) - Complete authentication system overview
- [Keycloak Configuration](../getting-started/configuration.md) - Environment setup
- [First Steps](../getting-started/first-steps.md) - Getting started guide
- [Invitation System](./invitations.md) - Tenant invitation endpoints

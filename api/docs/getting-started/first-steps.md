# First Steps

This guide walks you through testing the **Pure Keycloak authentication**, exploring multi-tenant features, and making your first API calls.

## Prerequisites

- Application running locally (see [Quick Start](./quick-start.md))
- PostgreSQL database prepared via TypeORM migrations
- Keycloak running and configured (docker-compose)

## Important: Pure Keycloak Architecture

**⚠️ This API does NOT provide `/auth/login` or `/auth/register` endpoints.** All authentication is handled by Keycloak.

To test the API, you have two options:
1. **Recommended**: Use Keycloak directly to authenticate
2. Test public endpoints and invitation flow

## Option 1: Testing with Keycloak (Recommended)

### 1. Create a Test User in Keycloak

1. Open Keycloak Admin Console: http://localhost:8090
2. Login with admin credentials:
   - Username: `admin`
   - Password: `password`
3. Select your realm (e.g., `mylegitech`)
4. Go to **Users** → **Add user**
5. Fill in user details:
   - Username: `testuser`
   - Email: `testuser@example.com`
   - First name: `Test`
   - Last name: `User`
   - Email verified: **ON**
6. Click **Create**
7. Go to **Credentials** tab
8. Click **Set password**:
   - Password: `Password123!`
   - Temporary: **OFF**
9. Click **Save**

### 2. Get Access Token from Keycloak

Use the Resource Owner Password Credentials flow to get a token:

```bash
curl -X POST 'http://localhost:8090/realms/mylegitech/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password' \
  -d 'client_id=mylegitech-api' \
  -d 'client_secret=VX8BWPs01wQw5LqR5v75FE8fIgRVQvR9' \
  -d 'username=testuser@example.com' \
  -d 'password=Password123!'
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "token_type": "Bearer"
}
```

**Save the `access_token`** - you'll use it for API requests.

### 3. Test Authentication

Call the `/auth/me` endpoint to verify authentication:

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response**:
```json
{
  "user": {
    "id": "user-uuid",
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User",
    "keycloakId": "keycloak-user-uuid"
  },
  "currentTenantId": "auto-created-tenant-uuid",
  "tenants": [
    {
      "id": "auto-created-tenant-uuid",
      "name": "Test's Workspace",
      "role": "OWNER"
    }
  ]
}
```

**Note**: On first login, a tenant is automatically created for the user.

### 4. Test Tenant-Scoped Resources

Create an item (tenant-scoped resource):

```bash
curl -X POST http://localhost:3000/items \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Item",
    "description": "Testing tenant isolation"
  }'
```

List items for your tenant:

```bash
curl -X GET http://localhost:3000/items \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Only items belonging to your active tenant are returned.**

### 5. Test Invitation System

Get your tenant ID from `/auth/me`, then create an invitation:

```bash
curl -X POST http://localhost:3000/tenants/YOUR_TENANT_ID/invitations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invited@example.com",
    "role": "MEMBER"
  }'
```

**Response**:
```json
{
  "id": "invitation-uuid",
  "email": "invited@example.com",
  "role": "MEMBER",
  "token": "invitation-token-uuid",
  "expiresAt": "2024-02-15T10:30:00Z"
}
```

## Option 2: Using Swagger UI

Swagger provides an interactive interface with Keycloak authentication built-in.

### 1. Open Swagger

Visit http://localhost:3000/swagger

### 2. Authenticate via Keycloak

1. Click the **Authorize** button (top right)
2. Enter your Keycloak token:
   ```
   Bearer YOUR_ACCESS_TOKEN
   ```
   (Get token using the curl command from Option 1, Step 2)
3. Click **Authorize**

### 3. Test Endpoints

Now you can try any protected endpoint:
- `GET /auth/me` - Get your user profile
- `GET /items` - List tenant items
- `POST /items` - Create a new item
- `POST /tenants/{tenantId}/invitations` - Invite users

## Testing Invitation Flow

### 1. Create an Invitation

As an authenticated user with `OWNER` or `ADMIN` role:

```bash
curl -X POST http://localhost:3000/tenants/YOUR_TENANT_ID/invitations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "role": "MEMBER"
  }'
```

### 2. Accept the Invitation

The invited user accepts via the public endpoint:

```bash
curl -X POST http://localhost:3000/auth/accept-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "token": "INVITATION_TOKEN_UUID"
  }'
```

**Response**:
```json
{
  "message": "Invitation accepted successfully. Please log in via Keycloak to access the tenant.",
  "user": {
    "email": "newuser@example.com",
    "firstName": null,
    "lastName": null
  },
  "tenant": {
    "id": "tenant-uuid",
    "name": "Test's Workspace"
  },
  "role": "MEMBER",
  "redirectToKeycloak": true,
  "keycloakLoginHint": "newuser@example.com"
}
```

### 3. New User Logs in via Keycloak

The new user must:
1. Create an account in Keycloak (if not already exists)
2. Log in via Keycloak
3. Get a JWT token
4. Use the token to access the tenant

## Token Refresh

When your access token expires, refresh it via Keycloak:

```bash
curl -X POST 'http://localhost:8090/realms/mylegitech/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=refresh_token' \
  -d 'client_id=mylegitech-api' \
  -d 'client_secret=VX8BWPs01wQw5LqR5v75FE8fIgRVQvR9' \
  -d 'refresh_token=YOUR_REFRESH_TOKEN'
```

**Note**: The API does **NOT** provide a `/auth/refresh` endpoint. Always use Keycloak's endpoint.

## Understanding Multi-Tenancy

### Active Tenant Context

Every JWT token includes a `tenantId` claim. This determines which tenant's data you can access.

**Example JWT Payload**:
```json
{
  "sub": "keycloak-user-uuid",
  "email": "testuser@example.com",
  "tenantId": "active-tenant-uuid",
  "iat": 1640000000,
  "exp": 1640003600
}
```

### Automatic Tenant Creation

If a Keycloak token **doesn't include** a `tenantId` claim:
- The API automatically creates a new tenant for the user
- User becomes the `OWNER` of the new tenant
- Tenant name: `{FirstName}'s Workspace` or `{Email}'s Workspace`

### Role-Based Access Control

Three roles per tenant:
- **OWNER**: Full control, cannot be removed from tenant
- **ADMIN**: Can manage members and invitations
- **MEMBER**: Can access tenant data, limited management capabilities

**Example**: Only `OWNER` and `ADMIN` can create invitations:

```typescript
@UseGuards(JwtAuthGuard, TenantRoleGuard)
@Roles(TenantRole.OWNER, TenantRole.ADMIN)
@Post(':tenantId/invitations')
async createInvitation() {
  // Protected endpoint
}
```

### Tenant Isolation

All resources are automatically filtered by tenant:
- Items, users, invitations are scoped to the active tenant
- Cross-tenant access is prevented at the database level
- TypeORM relations enforce tenant ID foreign keys

## Common Issues

### "401 Unauthorized" Error

**Causes**:
- Missing or invalid Keycloak token
- Token expired (default: 5 minutes)
- User no longer exists or access revoked

**Solution**:
```bash
# Get a fresh token from Keycloak
curl -X POST 'http://localhost:8090/realms/mylegitech/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password' \
  -d 'client_id=mylegitech-api' \
  -d 'client_secret=VX8BWPs01wQw5LqR5v75FE8fIgRVQvR9' \
  -d 'username=YOUR_EMAIL' \
  -d 'password=YOUR_PASSWORD'
```

### "403 Forbidden" Error

**Cause**: Insufficient permissions for the requested action

**Solution**: Check your role in the tenant. Only `OWNER`/`ADMIN` can perform certain actions.

### Keycloak Not Accessible

**Cause**: Keycloak container not running

**Solution**:
```bash
# From project root
docker-compose up -d keycloak

# Check status
docker-compose ps keycloak
```

## Next Steps

- [API Overview](../api/overview.md) - Explore all available endpoints
- [Multi-Tenancy Architecture](../architecture/multi-tenancy.md) - Deep dive into tenant isolation
- [Authentication Architecture](../architecture/authentication.md) - Understand Keycloak integration
- [Invitation System](../api/invitations.md) - Learn about tenant invitations

## Key Concepts Recap

- **Pure Keycloak Architecture**: API does NOT generate JWT tokens, only validates them
- **JWKS Validation**: API fetches public keys from Keycloak to verify token signatures
- **User Sync**: Users are automatically synchronized from Keycloak to local database
- **Auto-Tenant Creation**: New users automatically get a tenant on first login
- **Tenant Context**: JWT includes `tenantId` - all operations scoped to this tenant
- **Role-Based Access**: `OWNER`, `ADMIN`, `MEMBER` roles control permissions
- **Tenant Isolation**: Complete data isolation enforced at database level

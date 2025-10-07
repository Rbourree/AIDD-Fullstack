# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a full-stack multi-tenant boilerplate with NestJS backend and React frontend.

- `api/` - NestJS backend API with multi-tenant architecture and Keycloak authentication
- `app/` - React frontend application with Vite (includes Keycloak integration)

## Working with the API

All development commands should be run from the `api/` directory:

```bash
cd api
```

### Quick Start Commands

```bash
# Install and setup
npm install
npm run docker:up              # Start PostgreSQL, Keycloak, and Adminer
npm run typeorm:migration:run  # Apply migrations

# Development
npm run start:dev              # Start with hot-reload
npm run start:debug            # Start with debugger

# Database migrations
npm run typeorm:migration:generate --name <Name>
npm run typeorm:migration:run
npm run typeorm:migration:revert

# Code quality
npm run lint                   # ESLint with auto-fix
npm run format                 # Prettier formatting

# Docker services
npm run docker:up              # Start all services (PostgreSQL, Keycloak, Adminer)
npm run docker:down            # Stop all services
```

### Docker Services

The `docker-compose.yml` file is located at the **project root**. You can run it from anywhere:
- From `api/` directory: `npm run docker:up` or `npm run docker:down`
- From project root: `docker-compose up -d` or `docker-compose down`

When starting Docker services, the following containers are launched:

- **PostgreSQL** (port 5432) - Main application database
- **Keycloak** (port 8090) - Identity and access management
  - Admin console: http://localhost:8090
  - Default credentials: admin / password
- **Adminer** (port 8080) - Database management UI
- **Keycloak PostgreSQL** - Separate database for Keycloak
- **API** (port 3000) - NestJS application (optional, if using docker-compose for full stack)

## Working with the Frontend

All frontend commands should be run from the `app/` directory:

```bash
cd app
```

### Frontend Commands

```bash
# Install dependencies
npm install

# Development
npm run dev                    # Start Vite dev server with HMR

# Build
npm run build                  # Build for production

# Code quality
npm run lint                   # ESLint
npm run preview                # Preview production build
```

The frontend is built with React 19 + Vite and includes Keycloak integration via `@react-keycloak/web`.

## Architecture Overview

### Multi-Tenant System

The API implements complete tenant isolation:

- **JWT Payload**: Every JWT contains `{ sub: userId, tenantId: tenantId }`
- **Tenant Context**: `TenantFilterInterceptor` extracts `tenantId` from JWT and attaches it to requests
- **Access Control**: `TenantRoleGuard` validates user roles (OWNER/ADMIN/MEMBER) per tenant
- **Data Filtering**: All repository queries automatically filter by tenant ID

**Adding tenant-scoped resources:**
1. Add `tenantId` column to entity with `@ManyToOne` relation to `Tenant`
2. Always filter repository queries by the active tenant ID
3. Protect routes with `@UseGuards(JwtAuthGuard, TenantRoleGuard)` and `@Roles()` decorators

### Authentication Flow

- **Keycloak-only authentication** - Users authenticate via Keycloak SSO
- User records synchronized from Keycloak JWT tokens to local database
- Refresh tokens stored in `refresh_tokens` table (for API sessions)
- JWT strategy validates Keycloak tokens and syncs user data
- Auto-tenant creation for new Keycloak users (if no tenant specified in token)
- No password storage - authentication fully delegated to Keycloak

### External Integrations

Located in `api/src/common/integrations/`:

- **mail/** - Mailjet integration for transactional emails
- **yousign/** - eIDAS-compliant electronic signatures
- **ar24/** - Registered mail service

Each integration is a standalone NestJS module with service, exceptions, and interfaces.

### Module Structure

Each feature module follows this pattern:

```
module-name/
├── controllers/  → HTTP layer (routes, validation)
├── services/     → Business logic
├── repositories/ → Data access (TypeORM)
├── entities/     → Domain models
├── dto/          → Request/response validation
└── exceptions/   → Domain-specific errors
```

**Layer responsibilities:**
- Controllers handle HTTP concerns and delegate to services
- Services contain business logic and coordinate repositories
- Repositories encapsulate TypeORM queries and data access
- Keep these layers separated for maintainability

## Key Implementation Patterns

### Role-Based Access Control

Roles are defined in `TenantRole` enum:
- `OWNER` - Full control, cannot be removed from tenant
- `ADMIN` - Can manage members and invitations
- `MEMBER` - Can access tenant data

Protect endpoints:
```typescript
@UseGuards(JwtAuthGuard, TenantRoleGuard)
@Roles(TenantRole.OWNER, TenantRole.ADMIN)
```

### Tenant Isolation in Queries

Always filter by tenant ID in repository methods:

```typescript
findByTenant(tenantId: string, options?: FindOptions) {
  return this.repository.find({
    where: { tenant: { id: tenantId }, ...options?.where },
    ...options
  });
}
```

### Invitation System

- Invitations managed in `tenants` module
- Stored in `invitations` table with expiry timestamps
- Email templates use Handlebars via `MailTemplateService`
- Acceptance creates minimal user record (email only) - full profile populated on first Keycloak login
- Links user to tenant via `TenantUser` with specified role

### User Data Management

**User Entity Structure**:
- `id` (UUID) - Internal primary key generated by Postgres
- `keycloakId` (UUID, nullable, unique) - External reference to Keycloak user
- `email` (unique) - Synchronized from Keycloak
- `firstName`, `lastName` (nullable) - User-managed profile data (local priority)
- **No password field** - Authentication delegated to Keycloak

**Data Synchronization**:
- Email always synchronized from Keycloak (source of truth for identity)
- firstName/lastName only synced if empty locally (user can modify in app)
- keycloakId populated on first login via Keycloak
- Internal ID used for all database relations (stable across identity provider changes)

### Keycloak Integration

The application uses Keycloak as the identity provider:

- Users authenticate via Keycloak SSO
- JWT tokens from Keycloak are validated by the API
- User data is synchronized from Keycloak to local database on login
- `keycloakId` field links local users to Keycloak users
- First-time login auto-creates tenant if not specified in token

**Keycloak Configuration**:
- Realm, client ID, and JWKS URI configured in `.env`
- JWT validation uses JWKS endpoint for public key retrieval
- Both frontend and API must be configured with same Keycloak realm/client

## Documentation Structure

- **[README.md](./README.md)** (root) - Full-stack overview, quick start, and general documentation
- **[api/README.md](./api/README.md)** - Comprehensive backend API documentation
- **[api/docs/](./api/docs/)** - Detailed API documentation (architecture, guides, API reference)
- **[app/README.md](./app/README.md)** - React frontend documentation and setup
- **CLAUDE.md** (this file) - Instructions for Claude Code

## Development Workflow

1. **Starting development**: Run `docker-compose up -d` from root (or `npm run docker:up` from `api/`)
2. **Adding features**: Create module with full layered structure (controller → service → repository)
3. **Database changes**: Generate TypeORM migration with `npm run typeorm:migration:generate`
4. **Testing endpoints**: Swagger UI available at http://localhost:3000/swagger
5. **Pre-commit**: Husky runs ESLint and Prettier via lint-staged (API only)

## Configuration

### API Environment Variables

Environment variables configured in `api/.env` (see `api/.env.example`):

- **Database**: PostgreSQL connection settings
- **JWT**: Secrets and token expiration times
- **Keycloak**: Realm, auth server URL, client ID/secret, JWKS URI
- **External Services**: Mailjet (email), Yousign (e-signatures), AR24 (registered mail)
- **Monitoring**: Sentry DSN for error tracking
- **Security**: CORS origin, rate limiting thresholds

### Frontend Environment Variables

The frontend requires Keycloak configuration to match the API realm settings. Vite environment variables should be configured for the Keycloak client.

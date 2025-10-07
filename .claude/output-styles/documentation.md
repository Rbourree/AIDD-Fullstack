---
name: documentation
description: Technical documentation and guides with clear structure and practical examples
---

# Documentation Output Style

When writing technical documentation, you create clear, comprehensive, and developer-friendly content that serves both as reference and learning material.

## Documentation Principles

1. **User-first**: Write for the reader (developer), not for yourself
2. **Practical**: Every concept has a working code example
3. **Progressive**: Start simple, add complexity gradually
4. **Searchable**: Use clear headings and consistent terminology
5. **Maintainable**: Date examples, link to source code when possible
6. **Complete**: Cover happy path, edge cases, and error scenarios

## Document Structure

### README Template
```markdown
# [Feature/Module Name]

> Brief one-line description

## Overview
[2-3 paragraphs explaining what this is and why it exists]

## Quick Start
[Minimal example to get started in <5 minutes]

## Installation / Setup
[Step-by-step instructions with commands]

## Usage
### Basic Example
[Common use case with code]

### Advanced Usage
[More complex scenarios]

## API Reference
[Detailed interface/method documentation]

## Configuration
[Available options with defaults]

## Troubleshooting
[Common issues and solutions]

## Related Documentation
[Links to related docs]
```

### Code Example Format

Always include:
- **Commented code** explaining key parts
- **Input/output** examples
- **Context** (where this code lives in the project)

```typescript
/**
 * Create a new tenant-scoped resource
 *
 * @param tenantId - Extracted from JWT by TenantFilterInterceptor
 * @param createDto - Validated request body
 * @returns Created resource with tenant relation populated
 *
 * Location: api/src/modules/resources/services/resource.service.ts
 */
async create(tenantId: string, createDto: CreateResourceDto): Promise<Resource> {
  // Create entity with tenant relation (ensures tenant isolation)
  const resource = this.repository.create({
    ...createDto,
    tenant: { id: tenantId }, // TypeORM partial relation
  });

  // Save to database (tenantId foreign key constraint enforced)
  return this.repository.save(resource);
}
```

### Step-by-Step Guides

Use numbered lists with clear actions:

```markdown
## Adding a New Tenant-Scoped Module

1. **Generate module structure**
   ```bash
   cd api
   nest g module modules/invoices
   nest g controller modules/invoices/controllers/invoices --flat
   nest g service modules/invoices/services/invoices --flat
   ```

2. **Create entity with tenant relation**
   ```typescript
   // api/src/modules/invoices/entities/invoice.entity.ts
   @Entity('invoices')
   export class Invoice {
     @PrimaryGeneratedColumn('uuid')
     id: string;

     @ManyToOne(() => Tenant, { nullable: false })
     tenant: Tenant;

     // ... other fields
   }
   ```

3. **Add tenant filtering in repository**
   [Show repository code]

4. **Generate and run migration**
   ```bash
   npm run typeorm:migration:generate --name CreateInvoices
   npm run typeorm:migration:run
   ```

5. **Verify in Swagger**
   Navigate to http://localhost:3000/swagger#/invoices
```

## API Documentation Format

### Endpoint Documentation
```markdown
## POST /api/resources

Create a new resource for the authenticated tenant.

### Authentication
Requires valid JWT token from Keycloak.

### Authorization
Roles: `ADMIN`, `OWNER`

### Request

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Resource Name",
  "description": "Optional description",
  "metadata": {
    "key": "value"
  }
}
```

### Response

**Success (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Resource Name",
  "description": "Optional description",
  "metadata": {
    "key": "value"
  },
  "tenantId": "tenant-uuid",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Error (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": ["name must be a string", "name should not be empty"],
  "error": "Bad Request"
}
```

**Error (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### Example Request
```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Resource",
    "description": "Test resource"
  }'
```
```

## Configuration Documentation

### Environment Variable Template
```markdown
## Environment Variables

### Database
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_HOST` | Yes | - | PostgreSQL host address |
| `DB_PORT` | Yes | `5432` | PostgreSQL port |
| `DB_USERNAME` | Yes | - | Database username |
| `DB_PASSWORD` | Yes | - | Database password |

### Keycloak
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KEYCLOAK_AUTH_SERVER_URL` | Yes | - | Keycloak server URL (e.g., `http://localhost:8090`) |
| `KEYCLOAK_REALM` | Yes | - | Realm name (e.g., `mylegitech`) |

### Example .env File
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password

# Keycloak
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8090
KEYCLOAK_REALM=mylegitech
```
```

## Troubleshooting Section Format

```markdown
## Troubleshooting

### Token validation fails with "Invalid signature"

**Symptom:**
```
UnauthorizedException: Invalid token signature
```

**Cause:**
JWT signature validation failed because JWKS endpoint is unreachable or wrong public key.

**Solution:**
1. Verify Keycloak is running:
   ```bash
   curl http://localhost:8090/realms/mylegitech
   ```

2. Check JWKS URI in `.env`:
   ```
   KEYCLOAK_JWKS_URI=http://localhost:8090/realms/mylegitech/protocol/openid-connect/certs
   ```

3. Restart API to refresh JWKS cache:
   ```bash
   npm run start:dev
   ```

**Prevention:**
Ensure Keycloak starts before the API in docker-compose.

---

### Cannot query across tenants

**Symptom:**
Need to aggregate data from all tenants but repository filters by tenantId.

**Cause:**
By design - tenant isolation prevents cross-tenant queries.

**Solution:**
For admin-only reports, create a dedicated service method with explicit override:
```typescript
@Roles(TenantRole.PLATFORM_ADMIN) // Super admin only
async getAllTenantStats() {
  return this.repository.find(); // Deliberately unfiltered
}
```

**Warning:**
Only use in admin contexts. Audit log these queries.
```

## Diagrams and Visual Aids

### Architecture Diagrams
Include ASCII diagrams for flows:

```markdown
## Authentication Flow

```
User → Frontend → API → Keycloak
        │          │       │
        │          │       └─→ Validate credentials
        │          │           ↓
        │          │       Return JWT tokens
        │          │       ↓
        │          │←──────┘
        │          │
        │          └─→ Store tokens (secure storage)
        │              ↓
        │          Subsequent requests with Bearer token
        │              ↓
        │          KeycloakJwtStrategy validates via JWKS
```
```

### Tables for Comparison
Use tables for feature comparisons, version differences, etc.

## Writing Style

- **Active voice**: "The guard validates the token" (not "The token is validated")
- **Present tense**: "The service creates a record" (not "will create")
- **Imperative for instructions**: "Run npm install" (not "You should run")
- **Consistent terminology**: Pick one term and stick with it (e.g., "tenant" not "organization")
- **Avoid jargon**: Explain acronyms on first use
- **Code over prose**: Show working examples rather than lengthy explanations

## Common Documentation Sections

### For Features
- Overview
- Use cases
- Installation/setup
- Basic usage
- Advanced usage
- API reference
- Configuration
- Troubleshooting

### For Architecture
- System overview
- Components
- Data flow
- Security model
- Technology stack
- Design decisions (ADRs)

### For APIs
- Authentication
- Endpoints
- Request/response formats
- Error codes
- Rate limiting
- Examples

## Quality Checklist

Before publishing documentation:
- [ ] All code examples are tested and working
- [ ] Links are valid and point to correct locations
- [ ] Commands have been verified in actual shell
- [ ] Terminology is consistent throughout
- [ ] Table of contents for long documents
- [ ] Screenshots/diagrams are up-to-date
- [ ] Related docs are cross-linked
- [ ] Version/date information included

---
description: Quick access to common API development tasks
---

You are now working on the NestJS API (multi-tenant architecture with Keycloak authentication).

Current context:
- Directory: `api/`
- Framework: NestJS + TypeORM
- Architecture: Multi-tenant with complete tenant isolation
- Authentication: Pure Keycloak (no JWT token generation in API)
- Database: PostgreSQL

Common commands you can run from here:
- `npm run start:dev` - Start in watch mode
- `npm run build` - Build production bundle
- `npm run lint` - Lint and auto-fix
- `npm run typeorm:migration:generate --name <Name>` - Generate migration
- `npm run typeorm:migration:run` - Apply migrations
- `npm run docker:up` - Start PostgreSQL container

Key architectural patterns:
- Every entity must have `tenantId` for multi-tenant isolation
- All queries filtered by active tenant ID from JWT
- Routes protected with `@UseGuards(JwtAuthGuard, TenantRoleGuard)`
- Roles: OWNER, ADMIN, MEMBER (defined in TenantRole enum)

Remember: This API only VALIDATES Keycloak tokens - it does NOT generate them.

What would you like to work on in the API?

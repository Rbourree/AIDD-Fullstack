---
description: Generate a new TypeORM migration from entity changes
---

Generate a new TypeORM migration based on entity changes.

**Usage**: `/migration <MigrationName>`

Please follow these steps:

1. Ensure the database is running and up-to-date:
```bash
cd api
npm run docker:up
npm run typeorm:migration:run
```

2. Generate the migration (you'll need to provide a name):
```bash
npm run typeorm:migration:generate --name <MigrationName>
```

Example:
```bash
npm run typeorm:migration:generate --name AddUserProfileFields
```

3. Review the generated migration in `api/src/database/migrations/`

4. Apply the migration:
```bash
npm run typeorm:migration:run
```

**Tips**:
- Use PascalCase for migration names
- Make migration names descriptive (e.g., AddEmailVerification, UpdateTenantRoles)
- Always review generated SQL before applying
- Test migrations can be reverted with `npm run typeorm:migration:revert`

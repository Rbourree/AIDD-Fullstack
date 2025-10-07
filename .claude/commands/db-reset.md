---
description: Reset database and apply all migrations
---

Reset the PostgreSQL database and apply all TypeORM migrations.

**⚠️ WARNING: This will delete all data in the database!**

Please execute the following steps:

1. Stop the API if running
2. Drop and recreate the database:

```bash
cd api
npm run docker:up
docker exec -it mylegitech_postgres psql -U postgres -c "DROP DATABASE IF EXISTS mylegitech;"
docker exec -it mylegitech_postgres psql -U postgres -c "CREATE DATABASE mylegitech;"
```

3. Run all migrations:

```bash
npm run typeorm:migration:run
```

4. Restart the API:

```bash
npm run start:dev
```

The database is now reset with a clean schema. You may want to seed initial data if needed.

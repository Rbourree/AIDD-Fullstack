---
description: Start all Docker services (PostgreSQL, Keycloak, API, Frontend)
---

Start all project services using Docker Compose.

Please execute the following:

```bash
docker-compose up -d
```

This will start:
- **mylegitech_postgres** - PostgreSQL database on port 5432
- **mylegitech_keycloak** - Keycloak SSO server on port 8090
- **mylegitech_api** - NestJS API on port 3000 (with hot-reload)
- **mylegitech_app** - React frontend on port 5173 (with HMR)

After starting, you can:
- Check service status: `docker-compose ps`
- View logs: `docker-compose logs -f [service_name]`
- Access Keycloak admin: http://localhost:8090 (admin/admin)
- Access API: http://localhost:3000
- Access Frontend: http://localhost:5173

Services start with development mode enabled (hot-reload/HMR).

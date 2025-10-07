---
description: Stop all Docker services
---

Stop all project services using Docker Compose.

Please execute the following:

```bash
docker-compose down
```

This will stop and remove:
- mylegitech_postgres
- mylegitech_keycloak
- mylegitech_api
- mylegitech_app

⚠️ **Note**: This keeps volumes intact (database data is preserved).

To also remove volumes (completely reset database):
```bash
docker-compose down -v
```

To stop services without removing containers:
```bash
docker-compose stop
```

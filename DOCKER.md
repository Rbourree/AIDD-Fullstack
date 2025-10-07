# 🐳 Docker Configuration Guide

This document explains the Docker setup for the full-stack application.

---

## 📋 Overview

The project uses Docker Compose to orchestrate multiple services:

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| **mylegitech_postgres** | mylegitech-postgres | 5432 | Main PostgreSQL database |
| **keycloak_postgres** | keycloak_postgres | 5432 (internal) | Keycloak's PostgreSQL database |
| **keycloak** | keycloak_app | 8090 | Keycloak identity provider |
| **mylegitech_adminer** | mylegitech_adminer | 8080 | Adminer database UI |
| **mylegitech_api** | mylegitech-api | 3000 | NestJS backend API |
| **mylegitech_app** | mylegitech-app | 5173 | React frontend |

---

## 🚀 Quick Commands

### Start All Services

```bash
# From project root
docker-compose up -d
```

This starts the entire stack with hot-reload enabled for both frontend and backend.

### Start Specific Services

```bash
# Only infrastructure (for manual dev)
docker-compose up -d mylegitech_postgres keycloak keycloak_postgres mylegitech_adminer

# Only backend services
docker-compose up -d mylegitech_postgres mylegitech_api

# Only frontend
docker-compose up -d mylegitech_app
```

### Stop Services

```bash
# Stop all
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f mylegitech_app
docker-compose logs -f mylegitech_api
docker-compose logs -f keycloak
```

### Restart Services

```bash
# Restart a specific service
docker-compose restart mylegitech_app
docker-compose restart mylegitech_api
```

### Rebuild After Changes

```bash
# Rebuild and restart frontend
docker-compose build mylegitech_app
docker-compose up -d mylegitech_app

# Rebuild and restart backend
docker-compose build mylegitech_api
docker-compose up -d mylegitech_api

# Rebuild all
docker-compose build
docker-compose up -d
```

---

## 📁 Dockerfile Details

### Backend API (`api/Dockerfile`)

Multi-stage Dockerfile for NestJS:

- **Development stage**:
  - Uses Node.js 22 Alpine
  - Hot-reload enabled via volumes
  - Runs migrations on startup

- **Production stage**:
  - Builds the TypeScript code
  - Uses `start:prod` command
  - Smaller image size

### Frontend App (`app/Dockerfile`)

Multi-stage Dockerfile for React/Vite:

- **Development stage**:
  - Uses Node.js 22 Alpine
  - Vite dev server with HMR
  - Exposes port 5173
  - Runs with `--host 0.0.0.0` for Docker networking

- **Build stage**:
  - Compiles React app with Vite

- **Production stage**:
  - Serves static files with Nginx
  - Optimized for production
  - Includes caching and security headers

---

## 🔧 Configuration

### Environment Variables

#### API Service
Environment variables are loaded from `api/.env`:
```env
DATABASE_HOST=mylegitech_postgres  # Note: use container name, not localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=mylegitech
...
```

#### Frontend Service
Environment variables are loaded from `app/.env`:
```env
VITE_KEYCLOAK_URL=http://localhost:8090
VITE_KEYCLOAK_REALM=mylegitech
VITE_KEYCLOAK_CLIENT_ID=mylegitech-frontend
VITE_API_URL=http://localhost:3000/api
NODE_ENV=development
```

**Note**: Copy `app/.env.example` to `app/.env` before starting:
```bash
cd app
cp .env.example .env
```

### Volumes

#### API Volumes
```yaml
volumes:
  - ./api/src:/app/src  # Hot-reload for source code
```

#### Frontend Volumes
```yaml
volumes:
  - ./app/src:/app/src          # Hot-reload for source
  - ./app/public:/app/public    # Hot-reload for assets
  - /app/node_modules           # Prevent host override
```

The `/app/node_modules` volume prevents the host's node_modules from overriding the container's.

---

## 🌐 Networking

### Internal Communication

Services communicate using container names:

- API → PostgreSQL: `mylegitech_postgres:5432`
- Keycloak → Keycloak DB: `keycloak_postgres:5432`

### External Access

From your host machine:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000`
- Keycloak: `http://localhost:8090`
- Adminer: `http://localhost:8080`

### Keycloak Network

Keycloak services use a dedicated bridge network:
```yaml
networks:
  keycloak-network:
    name: keycloak-network
    driver: bridge
```

---

## 💾 Data Persistence

Volumes are created for data persistence:

```yaml
volumes:
  postgres_data:              # Main database data
    name: mylegitech_postgres
  postgres_data_keycloak:     # Keycloak database data
    name: keycloak_postgres
```

### Backup Data

```bash
# Backup main database
docker exec mylegitech-postgres pg_dump -U postgres mylegitech > backup.sql

# Restore main database
cat backup.sql | docker exec -i mylegitech-postgres psql -U postgres -d mylegitech
```

### Remove All Data

```bash
# ⚠️ WARNING: This deletes all database data
docker-compose down -v
docker volume rm mylegitech_postgres keycloak_postgres
```

---

## 🔥 Hot Reload

### Backend Hot Reload

The API container watches for changes in `api/src/` and automatically restarts:

```yaml
volumes:
  - ./api/src:/app/src
command: sh -c "npm run typeorm:migration:run && npm run start:dev"
```

NestJS's `--watch` flag handles hot-reload.

### Frontend Hot Reload

The frontend container uses Vite's HMR (Hot Module Replacement):

```yaml
volumes:
  - ./app/src:/app/src
  - ./app/public:/app/public
```

Changes to source files are reflected instantly in the browser.

---

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs -f [service-name]

# Check if port is already in use
lsof -i :3000  # API
lsof -i :5173  # Frontend
lsof -i :8090  # Keycloak
```

### Database Connection Issues

**Problem**: API can't connect to database

**Solution**: Use container name, not `localhost`
```env
# ❌ Wrong
DATABASE_HOST=localhost

# ✅ Correct
DATABASE_HOST=mylegitech_postgres
```

### Keycloak Takes Long to Start

Keycloak can take 30-60 seconds to fully initialize. Check logs:
```bash
docker-compose logs -f keycloak
```

Wait for: `Keycloak ... started in ...`

### Frontend Can't Connect to API

**Problem**: CORS errors or connection refused

**Solutions**:
1. Check API is running: `docker-compose ps`
2. Verify `VITE_API_URL` uses `localhost` (not container name)
3. Check CORS settings in `api/.env`:
   ```env
   CORS_ORIGIN=http://localhost:5173
   ```

### Hot Reload Not Working

**Frontend**:
```bash
# Restart the container
docker-compose restart mylegitech_app

# Check Vite is watching
docker-compose logs -f mylegitech_app
```

**Backend**:
```bash
# Restart the container
docker-compose restart mylegitech_api

# Check NestJS is watching
docker-compose logs -f mylegitech_api
```

### Node Modules Issues

If you see module errors:

```bash
# Rebuild the container
docker-compose build mylegitech_app --no-cache
docker-compose up -d mylegitech_app
```

---

## 🚀 Production Deployment

### Build Production Images

```bash
# Build API for production
docker build -t mylegitech-api:prod --target production ./api

# Build Frontend for production
docker build -t mylegitech-app:prod --target production ./app
```

### Production docker-compose.yml

Create `docker-compose.prod.yml`:

```yaml
services:
  mylegitech_api:
    build:
      context: ./api
      target: production  # Use production stage
    environment:
      - NODE_ENV=production
    # Remove development volumes

  mylegitech_app:
    build:
      context: ./app
      target: production  # Use nginx
    ports:
      - "80:80"  # Standard HTTP port
```

Run with:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [Vite Docker Guide](https://vitejs.dev/guide/build.html#docker)

---

## 🤝 Contributing

When modifying Docker configuration:

1. Test locally with `docker-compose up --build`
2. Verify hot-reload works
3. Check production builds
4. Update this documentation

---

<div align="center">

**[← Back to Main README](./README.md)** | **[View docker-compose.yml](./docker-compose.yml)**

</div>

<div align="center">

# 🚀 Full-Stack Multi-Tenant Boilerplate

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-10.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Keycloak-26-4D4D4D?style=for-the-badge&logo=keycloak&logoColor=white" alt="Keycloak" />
  <img src="https://img.shields.io/badge/TypeScript-5.1-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

<p align="center">
  <strong>A production-ready full-stack boilerplate with NestJS backend, React frontend, Keycloak SSO, and complete multi-tenant architecture</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-documentation">Documentation</a>
</p>

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🏢 Multi-Tenancy
- Complete tenant isolation
- Role-based access control (OWNER/ADMIN/MEMBER)
- Tenant switching with JWT context
- Automatic data filtering per tenant

### 🔐 Authentication & Security
- **Keycloak SSO** - Enterprise identity management
- JWT authentication with refresh tokens
- User synchronization from Keycloak
- Role-based access control
- Rate limiting & security headers

### 🎨 Frontend (React)
- **React 19** with Vite for blazing fast HMR
- Keycloak integration via `@react-keycloak/web`
- TypeScript support
- React Router for navigation
- Axios for API calls

</td>
<td width="50%">

### ⚡ Backend (NestJS)
- **NestJS 10** - Progressive Node.js framework
- **TypeORM** - Database ORM with migrations
- **Repository Pattern** - Clean architecture
- **Swagger** - Auto-generated API documentation
- Health checks with terminus

### 🛠️ Enterprise Integrations
- **Sentry** - Error tracking & monitoring
- **Mailjet** - Transactional emails
- **Yousign** - Electronic signatures (eIDAS)
- **AR24** - Registered mail service

### 🚀 Developer Experience
- TypeScript strict mode
- ESLint + Prettier + Husky
- Hot-reload for both frontend and backend
- Docker Compose for local development
- Comprehensive documentation

</td>
</tr>
</table>

---

## ⚡ Quick Start

Get the full stack running in 5 minutes:

### Prerequisites

- Node.js 22+
- npm 10+
- Docker & Docker Compose

### Option 1: Full Stack with Docker (Recommended)

```bash
# 1. Configure environment files
# API
cd api
cp .env.example .env
# Edit .env if needed (defaults work for local dev)

# Frontend (optional - defaults already set)
cd ../app
cp .env.example .env
# Edit .env if you need custom Keycloak/API URLs

# 2. Start all services (from project root)
cd ..
docker-compose up -d
```

This starts **everything**:
- **PostgreSQL** (port 5432) - Main database
- **Keycloak** (port 8090) - Identity provider
- **Adminer** (port 8080) - Database UI
- **API** (port 3000) - NestJS backend with hot-reload
- **Frontend** (port 5173) - React app with HMR
- **Keycloak PostgreSQL** - Separate Keycloak database

**Access the application:**
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api
- **Swagger**: http://localhost:3000/swagger
- **Keycloak Admin**: http://localhost:8090 (admin / password)
- **Adminer**: http://localhost:8080

### Option 2: Manual Development (Without Docker for App)

If you prefer to run frontend/backend manually:

```bash
# 1. Install dependencies
cd api && npm install
cd ../app && npm install

# 2. Start infrastructure only (from root)
docker-compose up -d mylegitech_postgres keycloak keycloak_postgres mylegitech_adminer

# 3. Configure environment
cd api
cp .env.example .env

# 4. Run migrations
npm run typeorm:migration:run

# 5. Start services in separate terminals
# Terminal 1 - API
cd api && npm run start:dev

# Terminal 2 - Frontend
cd app && npm run dev
```

---

## 🏗️ Project Structure

```
.
├── api/                          # NestJS Backend
│   ├── src/
│   │   ├── common/              # Shared resources (guards, interceptors, integrations)
│   │   ├── config/              # Configuration management
│   │   ├── database/            # TypeORM configuration & migrations
│   │   ├── modules/             # Feature modules
│   │   │   ├── auth/           # Keycloak authentication
│   │   │   ├── account/        # Users & tenants management
│   │   │   ├── items/          # Example tenant-scoped resource
│   │   │   └── health/         # Health check endpoints
│   │   └── main.ts
│   ├── docs/                    # Comprehensive API documentation
│   ├── README.md                # API-specific documentation
│   └── package.json
│
├── app/                          # React Frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   └── main.tsx
│   ├── README.md                # Frontend-specific documentation
│   └── package.json
│
├── docker-compose.yml            # Docker services (PostgreSQL, Keycloak, Adminer)
├── CLAUDE.md                     # Claude Code instructions
└── README.md                     # This file
```

---

## 📚 Documentation

### General Documentation
- **[DOCS.md](./DOCS.md)** - Complete documentation index
- **[DOCKER.md](./DOCKER.md)** - Docker configuration guide
- **[CLAUDE.md](./CLAUDE.md)** - Development guidelines for Claude Code

### Backend (API)

Complete documentation is available in [`api/docs/`](./api/docs/):

- **[Getting Started](./api/docs/getting-started/)** - Installation, quick start, configuration
- **[Architecture](./api/docs/architecture/)** - Multi-tenancy, authentication, patterns
- **[API Reference](./api/docs/api/)** - Complete endpoint documentation
- **[Integrations](./api/docs/integrations/)** - External services setup
- **[Development](./api/docs/development/)** - Adding features, best practices

📖 **[Browse API Documentation →](./api/README.md)**

### Frontend (App)

Frontend documentation is available in [`app/`](./app/):

- **[Frontend README](./app/README.md)** - React app setup and development

📖 **[Browse All Documentation →](./DOCS.md)**

---

## 🔐 Keycloak Integration

This boilerplate uses **Keycloak** as the single source of truth for authentication:

### Setup Keycloak

1. **Access Keycloak Admin Console**: http://localhost:8090
   - Username: `admin`
   - Password: `password`

2. **Create a Realm** (or use existing `mylegitech` realm)

3. **Configure Client**:
   - Client ID: `mylegitech-api` (for backend)
   - Client authentication: ON
   - Valid redirect URIs: `http://localhost:5173/*`
   - Web origins: `http://localhost:5173`

4. **Update Environment Variables**:
   - `api/.env`: Set `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`, `KEYCLOAK_JWKS_URI`
   - `app/.env.local`: Set Keycloak URL and client ID

### How It Works

- **Frontend**: Users authenticate via Keycloak login page
- **Backend**: Validates JWT tokens using Keycloak's JWKS endpoint
- **User Sync**: User data synchronized from Keycloak to local database
- **Tenant Management**: Multi-tenancy handled by the API, integrated with Keycloak users

---

## 🚀 Development

### API Development

```bash
cd api

# Development with hot-reload
npm run start:dev

# Debug mode
npm run start:debug

# Run migrations
npm run typeorm:migration:run

# Generate migration from entity changes
npm run typeorm:migration:generate --name MigrationName

# Lint & format
npm run lint
npm run format
```

📖 **[API Development Guide →](./api/docs/development/)**

### Frontend Development

```bash
cd app

# Development with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

### Docker Management

```bash
# From project root

# Start all services (API + Frontend + Infrastructure)
docker-compose up -d

# Start only infrastructure (for manual dev)
docker-compose up -d mylegitech_postgres keycloak keycloak_postgres mylegitech_adminer

# Stop all services
docker-compose down

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f mylegitech_app
docker-compose logs -f mylegitech_api

# Restart a service
docker-compose restart mylegitech_app

# Rebuild a service after code changes
docker-compose build mylegitech_app
docker-compose up -d mylegitech_app
```

**From `api/` directory:**
```bash
npm run docker:up    # Starts all services
npm run docker:down  # Stops all services
```

---

## 🔧 Configuration

### API Environment Variables

Key environment variables in `api/.env`:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=nestjs_db

# Keycloak
KEYCLOAK_REALM=mylegitech
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8090
KEYCLOAK_CLIENT_ID=mylegitech-api
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_JWKS_URI=http://localhost:8090/realms/mylegitech/protocol/openid-connect/certs

# JWT (for refresh tokens)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRATION=30d
```

📖 **[Complete Configuration Guide →](./api/docs/getting-started/configuration.md)**

### Frontend Environment Variables

The frontend uses `app/.env` for configuration (already created with defaults):

```env
VITE_KEYCLOAK_URL=http://localhost:8090
VITE_KEYCLOAK_REALM=mylegitech
VITE_KEYCLOAK_CLIENT_ID=mylegitech-frontend
VITE_API_URL=http://localhost:3000/api
NODE_ENV=development
```

**Customization**: Copy `app/.env.example` to `app/.env` and edit if needed.

---

## 🏗️ Architecture Highlights

### Multi-Tenancy

- **Complete Isolation**: Each tenant's data is isolated at the database level
- **JWT Context**: Every request includes tenant context
- **Automatic Filtering**: All queries automatically filter by tenant ID
- **Role-Based Access**: OWNER, ADMIN, and MEMBER roles per tenant

📖 **[Multi-Tenancy Architecture →](./api/docs/architecture/multi-tenancy.md)**

### Authentication Flow

1. User logs in via Keycloak (frontend)
2. Frontend receives Keycloak JWT token
3. Frontend sends token to API
4. API validates token via Keycloak JWKS
5. API creates local user record (if first login)
6. API returns access + refresh tokens with tenant context

📖 **[Authentication Architecture →](./api/docs/architecture/authentication.md)**

### Repository Pattern

Clean separation of concerns:
- **Controllers**: Handle HTTP requests
- **Services**: Business logic
- **Repositories**: Data access layer
- **Entities**: Database models

📖 **[Repository Pattern Guide →](./api/docs/architecture/repository-pattern.md)**

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Database connection failed | Run `docker-compose up -d` |
| Port conflicts | Change ports in `docker-compose.yml` and `.env` files |
| Keycloak not accessible | Wait ~30s for Keycloak to start, check logs: `docker-compose logs keycloak` |
| CORS errors | Check `CORS_ORIGIN` in `api/.env` matches frontend URL |
| JWT validation failed | Verify Keycloak configuration and JWKS URI |

📖 **[Complete Troubleshooting Guide →](./api/docs/troubleshooting.md)**

---

## 📖 Learn More

### For New Users
1. Follow the [Quick Start](#-quick-start) above
2. Read [API Quick Start](./api/QUICKSTART.md)
3. Explore the [API Documentation](./api/docs/)

### For Developers
1. Understand the [Architecture](./api/docs/architecture/overview.md)
2. Learn about [Multi-Tenancy](./api/docs/architecture/multi-tenancy.md)
3. Add your [First Feature](./api/docs/development/adding-features.md)

### For DevOps
1. Review [Docker Setup](./docker-compose.yml)
2. Configure [Production Deployment](./api/docs/deployment/production.md)
3. Manage [Database Migrations](./api/docs/deployment/migrations.md)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Code Standards**:
- Follow ESLint + Prettier rules (enforced by Husky)
- Write descriptive commit messages
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 💬 Support

- 📚 **Documentation**: [/api/docs](./api/docs)
- 🐛 **Bug Reports**: Open an issue
- 💡 **Feature Requests**: Start a discussion

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Built with ❤️ using NestJS, React, Keycloak, TypeScript, and TypeORM**

<p>
  <a href="https://nestjs.com">
    <img src="https://img.shields.io/badge/Backend-NestJS-E0234E?style=flat-square&logo=nestjs" alt="NestJS" />
  </a>
  <a href="https://react.dev">
    <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  </a>
  <a href="https://www.keycloak.org">
    <img src="https://img.shields.io/badge/Auth-Keycloak-4D4D4D?style=flat-square&logo=keycloak" alt="Keycloak" />
  </a>
  <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  </a>
</p>

**[📚 API Documentation](./api/docs)** | **[🚀 Quick Start](#-quick-start)** | **[🏗️ Architecture](./api/docs/architecture/overview.md)**

</div>

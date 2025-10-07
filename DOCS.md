# 📚 Documentation Index

This document provides a comprehensive index of all documentation available in this repository.

---

## 🏠 Main Documentation

### [README.md](./README.md)
**Start here!** Overview of the entire full-stack boilerplate, quick start guide, and general information about the project.

### [CLAUDE.md](./CLAUDE.md)
Instructions for Claude Code when working with this repository. Contains architecture insights, development patterns, and coding guidelines.

### [DOCKER.md](./DOCKER.md)
Complete Docker configuration guide including:
- Service overview and ports
- Docker commands reference
- Dockerfile details (API + Frontend)
- Hot-reload configuration
- Networking and volumes
- Troubleshooting
- Production deployment

---

## 🔧 Backend (API) Documentation

### [api/README.md](./api/README.md)
Comprehensive documentation for the NestJS backend API with rich formatting and examples.

### [api/QUICKSTART.md](./api/QUICKSTART.md)
5-minute quick start guide to get the API running locally.

### [api/docs/](./api/docs/)
Complete API documentation organized by topic:

#### Getting Started
- [Installation Guide](./api/docs/getting-started/installation.md)
- [Quick Start](./api/docs/getting-started/quick-start.md)
- [Configuration](./api/docs/getting-started/configuration.md)
- [First Steps](./api/docs/getting-started/first-steps.md)

#### Architecture
- [Overview](./api/docs/architecture/overview.md)
- [Multi-Tenancy System](./api/docs/architecture/multi-tenancy.md)
- [Repository Pattern](./api/docs/architecture/repository-pattern.md)
- [Authentication & Security](./api/docs/architecture/authentication.md)
- [Database Schema](./api/docs/architecture/database-schema.md)
- [Module Structure](./api/docs/architecture/module-structure.md)

#### API Reference
- [API Overview](./api/docs/api/overview.md)
- [Authentication Endpoints](./api/docs/api/authentication.md)
- [User Endpoints](./api/docs/api/users.md)
- [Tenant Endpoints](./api/docs/api/tenants.md)
- [Invitation Endpoints](./api/docs/api/invitations.md)

#### Integrations
- [Mailjet (Email)](./api/docs/integrations/mailjet.md)
- [Yousign (E-Signature)](./api/docs/integrations/yousign.md)
- [AR24 (Registered Mail)](./api/docs/integrations/ar24.md)
- [Sentry (Monitoring)](./api/docs/integrations/sentry.md)

#### Development
- [Development Setup](./api/docs/development/setup.md)
- [Adding Features](./api/docs/development/adding-features.md)
- [Best Practices](./api/docs/development/best-practices.md)
- [Commands Reference](./api/docs/development/commands.md)

#### Deployment
- [Docker Deployment](./api/docs/deployment/docker.md)
- [Production Guide](./api/docs/deployment/production.md)
- [Database Migrations](./api/docs/deployment/migrations.md)

#### Troubleshooting
- [Troubleshooting Guide](./api/docs/troubleshooting.md)

---

## 🎨 Frontend (App) Documentation

### [app/README.md](./app/README.md)
Complete documentation for the React frontend including:
- Setup and installation
- Keycloak integration guide
- API integration patterns
- Development workflow
- Deployment instructions
- Troubleshooting

---

## 🐳 Infrastructure & Docker

### [DOCKER.md](./DOCKER.md)
**Complete Docker guide** - Everything you need to know about the Docker setup.

### [docker-compose.yml](./docker-compose.yml)
Docker Compose configuration for running:
- PostgreSQL database
- Keycloak identity provider
- Adminer database UI
- Keycloak PostgreSQL database
- NestJS API (with hot-reload)
- React Frontend (with HMR)

**Quick commands:**
```bash
# Start all services (full stack)
docker-compose up -d

# Start only infrastructure
docker-compose up -d mylegitech_postgres keycloak keycloak_postgres mylegitech_adminer

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]
```

📖 **[Full Docker Documentation →](./DOCKER.md)**

---

## 📖 How to Navigate This Documentation

### 👋 New to the Project?

1. Read the [main README](./README.md) for an overview
2. Follow the [Quick Start](#quick-start) to get running
3. Read [api/docs/getting-started/first-steps.md](./api/docs/getting-started/first-steps.md)

### 🔨 Setting Up Development?

1. [API Installation](./api/docs/getting-started/installation.md)
2. [Frontend Setup](./app/README.md#-quick-start)
3. [Configure Keycloak](./app/README.md#-keycloak-integration)
4. [Environment Variables](./api/docs/getting-started/configuration.md)

### 🏗️ Understanding the Architecture?

1. [Architecture Overview](./api/docs/architecture/overview.md)
2. [Multi-Tenancy System](./api/docs/architecture/multi-tenancy.md)
3. [Authentication Flow](./api/docs/architecture/authentication.md)
4. [Database Schema](./api/docs/architecture/database-schema.md)

### 👨‍💻 Adding Features?

1. [Module Structure](./api/docs/architecture/module-structure.md)
2. [Repository Pattern](./api/docs/architecture/repository-pattern.md)
3. [Adding Features Guide](./api/docs/development/adding-features.md)
4. [Best Practices](./api/docs/development/best-practices.md)

### 🔌 Integrating External Services?

1. [Integrations Overview](./api/docs/integrations/)
2. [Mailjet (Email)](./api/docs/integrations/mailjet.md)
3. [Yousign (E-Signature)](./api/docs/integrations/yousign.md)
4. [Sentry (Monitoring)](./api/docs/integrations/sentry.md)

### 🚀 Deploying to Production?

1. [Production Guide](./api/docs/deployment/production.md)
2. [Docker Deployment](./api/docs/deployment/docker.md)
3. [Database Migrations](./api/docs/deployment/migrations.md)

### 🐛 Having Issues?

1. [API Troubleshooting](./api/docs/troubleshooting.md)
2. [Frontend Troubleshooting](./app/README.md#-troubleshooting)
3. Check [GitHub Issues](../../issues)

---

## 📝 Documentation Standards

When contributing documentation:

### Format
- Use Markdown (.md) files
- Include a clear title and description
- Use code blocks with language tags
- Add links to related documents

### Structure
```markdown
# Document Title

Brief description of what this document covers.

## Section 1

Content...

## Section 2

Content...

## See Also
- [Related Document](./path/to/doc.md)
```

### Location
- **General docs**: Project root
- **API-specific docs**: `api/docs/`
- **Frontend-specific docs**: `app/` (create `app/docs/` if needed)

### Categories
- `getting-started/` - Installation, setup, first steps
- `architecture/` - System design and patterns
- `api/` - API endpoint reference
- `development/` - Development guides
- `deployment/` - Production deployment
- `integrations/` - External services

---

## 🔍 Quick Reference

| Topic | Link |
|-------|------|
| **Quick Start** | [README.md](./README.md#-quick-start) |
| **API Setup** | [api/QUICKSTART.md](./api/QUICKSTART.md) |
| **Frontend Setup** | [app/README.md](./app/README.md#-quick-start) |
| **Multi-Tenancy** | [api/docs/architecture/multi-tenancy.md](./api/docs/architecture/multi-tenancy.md) |
| **Authentication** | [api/docs/architecture/authentication.md](./api/docs/architecture/authentication.md) |
| **Keycloak Setup** | [app/README.md#-keycloak-integration](./app/README.md#-keycloak-integration) |
| **API Reference** | [api/docs/api/](./api/docs/api/) or http://localhost:3000/swagger |
| **Troubleshooting** | [api/docs/troubleshooting.md](./api/docs/troubleshooting.md) |
| **Docker Guide** | [DOCKER.md](./DOCKER.md) |
| **docker-compose.yml** | [docker-compose.yml](./docker-compose.yml) |

---

## 🆘 Getting Help

- 📚 **Browse Documentation**: Use this index to find relevant docs
- 🔍 **Search**: Use your editor's search across all `.md` files
- 🐛 **Issues**: Check existing issues or create a new one
- 💬 **Discussions**: Start a discussion for questions

---

## 📄 License

All documentation is licensed under MIT - see [LICENSE](./LICENSE)

---

<div align="center">

**[← Back to Main README](./README.md)** | **[API Docs →](./api/docs/)** | **[Frontend Docs →](./app/README.md)**

</div>

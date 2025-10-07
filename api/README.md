<div align="center">

# 🚀 NestJS Multi-Tenant API Boilerplate

> **Part of the Full-Stack Multi-Tenant Boilerplate** - [View Full Project](../README.md)

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-10.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.1-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TypeORM-0.3-FF6C37?style=for-the-badge&logo=typeorm&logoColor=white" alt="TypeORM" />
  <img src="https://img.shields.io/badge/Keycloak-26-4D4D4D?style=for-the-badge&logo=keycloak&logoColor=white" alt="Keycloak" />
  <img src="https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

<p align="center">
  <strong>A production-ready NestJS boilerplate with Keycloak SSO, multi-tenant architecture, comprehensive security, and enterprise-grade integrations</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="./docs">📚 Full Documentation</a> •
  <a href="#-project-structure">Structure</a>
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

### 🔐 Security & Authentication
- **Keycloak SSO** - Enterprise identity management
- JWT authentication with Keycloak token validation
- Token validation via Keycloak JWKS endpoint
- User synchronization from Keycloak
- Rate limiting (global + auth-specific)
- Helmet security headers
- CORS configuration

</td>
<td width="50%">

### 🛠️ Enterprise Integrations
- **Sentry** - Error tracking & performance monitoring
- **Mailjet** - Email service for invitations
- **Yousign** - Electronic signature (eIDAS)
- **AR24** - Registered mail service

### 🚀 Developer Experience
- TypeScript 5.1+ strict mode
- Repository pattern with TypeORM
- Auto-generated Swagger documentation
- Hot-reload development
- ESLint + Prettier + Husky
- Docker Compose setup

</td>
</tr>
</table>

---

## ⚡ Quick Start

Get up and running in 5 minutes:

```bash
# 1. Clone and install
git clone <repository-url>
cd nestjs-api
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start database
npm run docker:up

# 4. Setup database
npm run typeorm:migration:run

# 5. Start the API
npm run start:dev
```

**Access**:
- API: http://localhost:3000
- Swagger: http://localhost:3000/swagger
- Health: http://localhost:3000/health

➡️ **For detailed setup instructions, see the [Quick Start Guide](./docs/getting-started/quick-start.md)**

---

## 📚 Documentation

Complete documentation is available in the `/docs` directory:

### Getting Started
- **[Installation Guide](./docs/getting-started/installation.md)** - Complete installation instructions
- **[Quick Start](./docs/getting-started/quick-start.md)** - Get running in 5 minutes
- **[Configuration](./docs/getting-started/configuration.md)** - Environment variables
- **[First Steps](./docs/getting-started/first-steps.md)** - Make your first API call

### Architecture
- **[Overview](./docs/architecture/overview.md)** - System architecture
- **[Multi-Tenancy](./docs/architecture/multi-tenancy.md)** - Tenant isolation system
- **[Repository Pattern](./docs/architecture/repository-pattern.md)** - Data access layer
- **[Authentication](./docs/architecture/authentication.md)** - JWT & security
- **[Database Schema](./docs/architecture/database-schema.md)** - Data models
- **[Module Structure](./docs/architecture/module-structure.md)** - Code organization

### API Reference
- **[API Overview](./docs/api/overview.md)** - API conventions & authentication
- **Interactive Swagger**: http://localhost:3000/swagger

### Development
- **[Adding Features](./docs/development/adding-features.md)** - Step-by-step module creation
- **[Best Practices](./docs/development/best-practices.md)** - Coding standards
- **[Commands Reference](./docs/development/commands.md)** - All npm scripts

### Deployment
- **[Docker Deployment](./docs/deployment/docker.md)** - Containerized deployment
- **[Production Guide](./docs/deployment/production.md)** - Production best practices

### Troubleshooting
- **[Troubleshooting Guide](./docs/troubleshooting.md)** - Common issues & solutions

**📖 [Browse Full Documentation →](./docs)**

---

## 🏗️ Project Structure

```
src/
├── common/                    # Shared resources
│   ├── decorators/           # @Public, @Roles, @CurrentUser
│   ├── filters/              # Exception filters
│   ├── guards/               # JwtAuthGuard, TenantRoleGuard
│   ├── interceptors/         # SentryInterceptor, TenantFilterInterceptor
│   └── integrations/         # External APIs (Mail, Yousign, AR24)
├── config/                   # Configuration management
├── database/                 # TypeORM configuration & providers
├── modules/                  # Feature modules
│   ├── auth/                # Authentication & authorization
│   ├── users/               # User management
│   ├── tenants/             # Tenant & invitation management
│   ├── items/               # Example tenant-scoped resource
│   └── health/              # Health check
├── app.module.ts
└── main.ts
```

**Architecture**:
- **Repository Pattern**: Clean separation between data access and business logic
- **Multi-Tenancy**: Complete tenant isolation with JWT-based context
- **Layered Architecture**: Controller → Service → Repository → TypeORM → Database

➡️ **[Learn more about the architecture](./docs/architecture/overview.md)**

---

## 🚀 Development Commands

```bash
# Development
npm run start:dev          # Hot-reload development server
npm run start:debug        # Debug mode with inspector

# Build & Production
npm run build              # Compile TypeScript
npm run start:prod         # Run production build

# Database
npm run typeorm:migration:run      # Apply pending migrations
npm run typeorm:migration:revert   # Roll back the last migration
npm run typeorm:migration:generate # Generate a migration from entity changes
npm run typeorm:migration:create   # Create an empty migration file

# Docker
npm run docker:up          # Start PostgreSQL container
npm run docker:down        # Stop containers

# Code Quality
npm run lint               # ESLint auto-fix
npm run format             # Prettier formatting
```

➡️ **[See all commands](./docs/development/commands.md)**

---

## 🔐 Multi-Tenancy & Security

### Tenant Isolation

Every resource is scoped to a tenant:
- **JWT Context**: Each JWT contains `userId` + `tenantId`
- **Automatic Filtering**: All queries filter by active tenant
- **Access Control**: Role-based permissions (OWNER/ADMIN/MEMBER)
- **Database Enforcement**: Foreign keys ensure data integrity

### Security Features

| Feature | Implementation |
|---------|---------------|
| Authentication | Keycloak JWT validation (JWKS) |
| Password Hashing | Bcrypt (12 rounds) |
| Password Strength | 8+ chars, upper/lower/number/special |
| Token Refresh | Keycloak refresh endpoint |
| Rate Limiting | 100 req/min global, 5 req/min auth |
| Tenant Validation | Checked on every request |
| Error Tracking | Sentry integration |

➡️ **[Learn more about multi-tenancy](./docs/architecture/multi-tenancy.md)**

➡️ **[Security architecture details](./docs/architecture/authentication.md)**

---

## 🔌 Integrations

- **[Mailjet](./docs/integrations/mailjet.md)** - Transactional emails (invitations, notifications)
- **[Yousign](./docs/integrations/yousign.md)** - eIDAS-compliant electronic signatures
- **[AR24](./docs/integrations/ar24.md)** - Registered mail with legal proof
- **[Sentry](./docs/integrations/sentry.md)** - Error tracking and performance monitoring

All integrations are optional and can be configured via environment variables.

---

## 🐛 Troubleshooting

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Database connection failed | `npm run docker:up` |
| Port 3000 in use | Change `PORT` in `.env` |
| TypeORM CLI error | Check `.env` and rerun `npm run typeorm:migration:run` |
| JWT errors | Get new token from Keycloak |
| Migration failed | `npm run typeorm:migration:revert` |

➡️ **[Complete troubleshooting guide](./docs/troubleshooting.md)**

---

## 📖 Learn More

### For New Users
1. Follow the [Quick Start Guide](./docs/getting-started/quick-start.md)
2. Read [First Steps](./docs/getting-started/first-steps.md)
3. Explore the [API](./docs/api/overview.md)

### For Developers
1. Understand the [Architecture](./docs/architecture/overview.md)
2. Learn the [Repository Pattern](./docs/architecture/repository-pattern.md)
3. Add your [First Feature](./docs/development/adding-features.md)

### For DevOps
1. Review [Production Setup](./docs/deployment/production.md)
2. Configure [Docker Deployment](./docs/deployment/docker.md)
3. Manage [Database Migrations](./docs/deployment/migrations.md)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Code Standards**:
- Follow ESLint + Prettier rules
- Write descriptive commit messages
- Add tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

- 📚 **Documentation**: [/docs](./docs)
- 🐛 **Bug Reports**: [Open an issue](https://github.com/your-repo/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/your-repo/discussions)
- 📧 **Email**: support@yourdomain.com

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Built with ❤️ using NestJS, TypeORM, TypeScript**

<p>
  <a href="https://nestjs.com">
    <img src="https://img.shields.io/badge/Powered%20by-NestJS-E0234E?style=flat-square&logo=nestjs" alt="NestJS" />
  </a>
  <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/Written%20in-TypeScript-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  </a>
  <a href="https://typeorm.io">
    <img src="https://img.shields.io/badge/ORM-TypeORM-FF6C37?style=flat-square&logo=typeorm&logoColor=white" alt="TypeORM" />
  </a>
</p>

**[📚 Browse Full Documentation](./docs)** | **[🚀 Quick Start](./docs/getting-started/quick-start.md)** | **[🏗️ Architecture](./docs/architecture/overview.md)**

</div>

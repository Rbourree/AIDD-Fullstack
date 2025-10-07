---
description: Quick access to common frontend development tasks
---

You are now working on the React frontend application.

Current context:
- Directory: `app/`
- Framework: React 19 + Vite
- Authentication: Keycloak integration (receives JWT tokens from Keycloak)
- Styling: TailwindCSS + shadcn/ui

Common commands you can run from here:
- `npm run dev` - Start development server with HMR
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Lint and auto-fix

Key architectural patterns:
- Keycloak integration for SSO authentication
- JWT tokens obtained from Keycloak, sent to API with each request
- Multi-tenant context managed in application state
- API calls to NestJS backend at `/api`

Environment variables (app/.env):
- VITE_KEYCLOAK_URL - Keycloak server URL
- VITE_KEYCLOAK_REALM - Keycloak realm name
- VITE_KEYCLOAK_CLIENT_ID - Client ID for frontend
- VITE_API_URL - Backend API URL

Remember: Authentication flows through Keycloak - no local authentication logic.

What would you like to work on in the frontend?

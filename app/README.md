# React Frontend - Multi-Tenant Application

This is the React frontend for the multi-tenant boilerplate, built with **React 19**, **Vite**, and integrated with **Keycloak** for authentication.

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- npm 10+
- Running backend API (see [../api/README.md](../api/README.md))
- Running Keycloak instance (via `docker-compose up -d` from project root)

### Installation

```bash
npm install
```

### Configuration

Create `.env.local` file:

```env
VITE_KEYCLOAK_URL=http://localhost:8090
VITE_KEYCLOAK_REALM=mylegitech
VITE_KEYCLOAK_CLIENT_ID=mylegitech-frontend
VITE_API_URL=http://localhost:3000/api
```

### Development

```bash
# Start dev server with hot-reload
npm run dev
```

The app will be available at http://localhost:5173 (or the port shown in terminal).

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
npm run lint
```

---

## 🏗️ Project Structure

```
src/
├── components/          # Reusable React components
├── pages/              # Page components (routes)
├── services/           # API service layer
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── App.tsx             # Main app component
└── main.tsx            # Application entry point
```

---

## 🔐 Keycloak Integration

This application uses **Keycloak** for authentication via the `@react-keycloak/web` package.

### Setup

1. **Configure Keycloak Client**:
   - Log in to Keycloak Admin Console: http://localhost:8090
   - Create or use existing realm (e.g., `mylegitech`)
   - Create a public client for the frontend:
     - Client ID: `mylegitech-frontend`
     - Client authentication: OFF (public client)
     - Valid redirect URIs: `http://localhost:5173/*`
     - Valid post logout redirect URIs: `http://localhost:5173/*`
     - Web origins: `http://localhost:5173`

2. **Update Environment Variables**:
   - Set `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, and `VITE_KEYCLOAK_CLIENT_ID` in `.env.local`

### Usage

The Keycloak provider wraps the entire application and provides authentication context:

```tsx
import { useKeycloak } from '@react-keycloak/web';

function MyComponent() {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!keycloak.authenticated) {
    return <button onClick={() => keycloak.login()}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {keycloak.tokenParsed?.preferred_username}</p>
      <button onClick={() => keycloak.logout()}>Logout</button>
    </div>
  );
}
```

### Getting the Access Token

To make authenticated API requests:

```tsx
const { keycloak } = useKeycloak();

// Get the token
const token = keycloak.token;

// Use with axios
axios.get('/api/v1/users/me', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

---

## 🌐 API Integration

The frontend communicates with the NestJS backend API.

### API Service

Create services to interact with the API:

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = keycloak.token; // Get from Keycloak
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Example API Calls

```typescript
// Get current user profile
const { data } = await api.get('/v1/users/me');

// Get tenant items
const { data } = await api.get('/v1/items');

// Create new item
const { data } = await api.post('/v1/items', {
  name: 'New Item',
  description: 'Description'
});
```

---

## 🎨 Styling

This project uses [your styling solution - update as needed]:

- CSS Modules / Styled Components / Tailwind / etc.
- Component-specific styles
- Global styles in `src/styles/`

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 📦 Tech Stack

- **React 19** - UI library with latest features
- **Vite** - Next-generation frontend tooling
- **TypeScript** - Type-safe JavaScript
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **@react-keycloak/web** - Keycloak integration
- **keycloak-js** - Keycloak JavaScript adapter

---

## 🔍 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_KEYCLOAK_URL` | Keycloak server URL | `http://localhost:8090` |
| `VITE_KEYCLOAK_REALM` | Keycloak realm name | `mylegitech` |
| `VITE_KEYCLOAK_CLIENT_ID` | Keycloak client ID | `mylegitech-frontend` |
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` |

---

## 🐛 Troubleshooting

### Keycloak Authentication Issues

**Problem**: "Failed to initialize Keycloak"
- **Solution**: Verify Keycloak is running: `docker-compose ps keycloak`
- Check Keycloak URL in `.env.local` is correct
- Ensure realm and client exist in Keycloak admin console

**Problem**: CORS errors when calling API
- **Solution**: Check `CORS_ORIGIN` in backend `.env` matches frontend URL
- Verify Keycloak "Web Origins" includes frontend URL

**Problem**: Token expired errors
- **Solution**: Keycloak automatically refreshes tokens. If issues persist, log out and back in.

### Development Server Issues

**Problem**: Port 5173 already in use
- **Solution**: Vite will automatically try the next available port, or specify: `vite --port 3001`

**Problem**: Environment variables not loading
- **Solution**:
  - Ensure `.env.local` exists and has `VITE_` prefix
  - Restart dev server after changing environment variables

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Environment Variables in Production

Set the following environment variables in your deployment platform:

- `VITE_KEYCLOAK_URL`
- `VITE_KEYCLOAK_REALM`
- `VITE_KEYCLOAK_CLIENT_ID`
- `VITE_API_URL`

### Hosting Options

- **Vercel**: Connect your git repository and deploy
- **Netlify**: Drag and drop `dist/` folder or connect git
- **Docker**: Build a Docker image with nginx to serve static files
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket

---

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Keycloak JS Adapter](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter)
- [Backend API Documentation](../api/docs)

---

## 🤝 Contributing

When contributing to the frontend:

1. Follow React best practices
2. Use TypeScript for type safety
3. Run `npm run lint` before committing
4. Keep components small and reusable
5. Document complex logic with comments

---

## 📄 License

MIT License - See [../LICENSE](../LICENSE)

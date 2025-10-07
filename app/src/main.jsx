import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './config/keycloak'

const keycloakProviderInitConfig = {
  onLoad: 'check-sso',
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  pkceMethod: 'S256',
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={keycloakProviderInitConfig}
  >
    <App />
  </ReactKeycloakProvider>
)

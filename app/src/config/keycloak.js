import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8090',
  realm: 'mylegitech',
  clientId: 'mylegitech-app',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;

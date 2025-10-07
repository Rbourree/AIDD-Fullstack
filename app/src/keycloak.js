import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://<URL_KEYCLOAK>/auth',
  realm: '<REALM>',
  clientId: '<CLIENT_ID>',
});

export default keycloak;

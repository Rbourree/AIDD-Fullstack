import { useKeycloak } from '@react-keycloak/web';

export const useAuth = () => {
  const { keycloak, initialized } = useKeycloak();

  return {
    isAuthenticated: keycloak.authenticated,
    token: keycloak.token,
    user: keycloak.tokenParsed,
    loading: !initialized,
    login: () => keycloak.login(),
    logout: () => keycloak.logout(),
    keycloak,
  };
};

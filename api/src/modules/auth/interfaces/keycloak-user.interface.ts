/**
 * Keycloak User Representation
 * Simplified interface for Keycloak Admin API user operations
 */
export interface KeycloakUserRepresentation {
  id?: string;
  username?: string;
  email?: string;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  credentials?: KeycloakCredential[];
  attributes?: Record<string, string[]>;
}

/**
 * Keycloak Credential
 * Used for password reset and initial password setup
 */
export interface KeycloakCredential {
  type: string;
  value: string;
  temporary?: boolean;
}

/**
 * Keycloak Admin Token Response
 */
export interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  'not-before-policy': number;
  session_state: string;
  scope: string;
}

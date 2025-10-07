import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base exception for Keycloak-related errors
 */
export class KeycloakException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message, status);
  }
}

/**
 * Exception thrown when Keycloak user creation fails
 */
export class KeycloakUserCreationException extends KeycloakException {
  constructor(email: string, details?: string) {
    super(
      `Failed to create Keycloak user for email: ${email}${details ? ` - ${details}` : ''}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Exception thrown when Keycloak user update fails
 */
export class KeycloakUserUpdateException extends KeycloakException {
  constructor(keycloakId: string, details?: string) {
    super(
      `Failed to update Keycloak user ${keycloakId}${details ? ` - ${details}` : ''}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Exception thrown when Keycloak user not found
 */
export class KeycloakUserNotFoundException extends KeycloakException {
  constructor(identifier: string) {
    super(`Keycloak user not found: ${identifier}`, HttpStatus.NOT_FOUND);
  }
}

/**
 * Exception thrown when Keycloak user deletion fails
 */
export class KeycloakUserDeletionException extends KeycloakException {
  constructor(keycloakId: string, details?: string) {
    super(
      `Failed to delete Keycloak user ${keycloakId}${details ? ` - ${details}` : ''}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Exception thrown when admin token cannot be obtained
 */
export class KeycloakAdminTokenException extends KeycloakException {
  constructor(details?: string) {
    super(
      `Failed to obtain Keycloak admin token${details ? ` - ${details}` : ''}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * Exception thrown when password reset fails
 */
export class KeycloakPasswordResetException extends KeycloakException {
  constructor(identifier: string, details?: string) {
    super(
      `Failed to send password reset for user ${identifier}${details ? ` - ${details}` : ''}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Exception thrown when email verification fails
 */
export class KeycloakEmailVerificationException extends KeycloakException {
  constructor(identifier: string, details?: string) {
    super(
      `Failed to send verification email for user ${identifier}${details ? ` - ${details}` : ''}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

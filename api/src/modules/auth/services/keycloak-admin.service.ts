import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import {
  KeycloakAdminTokenException,
  KeycloakUserCreationException,
  KeycloakUserUpdateException,
  KeycloakUserNotFoundException,
  KeycloakUserDeletionException,
  KeycloakPasswordResetException,
  KeycloakEmailVerificationException,
} from '../exceptions/keycloak.exceptions';
import { KeycloakUserRepresentation } from '../interfaces/keycloak-user.interface';
import { CreateKeycloakUserDto } from '../dto/create-keycloak-user.dto';
import { UpdateKeycloakUserDto } from '../dto/update-keycloak-user.dto';

/**
 * Service for managing Keycloak users via Admin API
 * Requires a client with client_credentials grant and admin permissions
 */
@Injectable()
export class KeycloakAdminService {
  private readonly logger = new Logger(KeycloakAdminService.name);
  private adminClient: KcAdminClient;
  private readonly baseUrl: string;
  private readonly realm: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('keycloak.authServerUrl');
    this.realm = this.configService.get<string>('keycloak.realm');
    this.clientId = this.configService.get<string>('keycloak.clientId');
    this.clientSecret = this.configService.get<string>('keycloak.clientSecret');

    this.adminClient = new KcAdminClient({
      baseUrl: this.baseUrl,
      realmName: this.realm,
    });
  }

  /**
   * Authenticate and get admin access token
   * Uses client_credentials grant type with client secret
   */
  private async ensureAuthenticated(): Promise<void> {
    try {
      await this.adminClient.auth({
        grantType: 'client_credentials',
        clientId: this.clientId,
        clientSecret: this.clientSecret,
      });

      this.logger.debug('Successfully authenticated with Keycloak Admin API');
    } catch (error) {
      this.logger.error('Failed to authenticate with Keycloak Admin API', error.stack);
      throw new KeycloakAdminTokenException(error.message);
    }
  }

  /**
   * Create a new user in Keycloak
   * @param userData - User data for creation
   * @returns Keycloak user ID
   */
  async createUser(userData: CreateKeycloakUserDto): Promise<string> {
    await this.ensureAuthenticated();

    try {
      const keycloakUser: KeycloakUserRepresentation = {
        email: userData.email,
        username: userData.username || userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: userData.enabled ?? true,
        emailVerified: userData.emailVerified ?? false,
      };

      this.logger.log(`Creating Keycloak user: ${userData.email}`);

      const { id } = await this.adminClient.users.create(keycloakUser);

      this.logger.log(`Keycloak user created successfully: ${id} (${userData.email})`);

      return id;
    } catch (error) {
      this.logger.error(`Failed to create Keycloak user: ${userData.email}`, error.stack);
      throw new KeycloakUserCreationException(userData.email, error.message);
    }
  }

  /**
   * Update an existing Keycloak user
   * @param keycloakId - Keycloak user ID
   * @param userData - User data to update
   */
  async updateUser(keycloakId: string, userData: UpdateKeycloakUserDto): Promise<void> {
    await this.ensureAuthenticated();

    try {
      const updateData: Partial<KeycloakUserRepresentation> = {};

      if (userData.email !== undefined) updateData.email = userData.email;
      if (userData.firstName !== undefined) updateData.firstName = userData.firstName;
      if (userData.lastName !== undefined) updateData.lastName = userData.lastName;
      if (userData.enabled !== undefined) updateData.enabled = userData.enabled;
      if (userData.emailVerified !== undefined) updateData.emailVerified = userData.emailVerified;

      this.logger.log(`Updating Keycloak user: ${keycloakId}`);

      await this.adminClient.users.update({ id: keycloakId }, updateData);

      this.logger.log(`Keycloak user updated successfully: ${keycloakId}`);
    } catch (error) {
      this.logger.error(`Failed to update Keycloak user: ${keycloakId}`, error.stack);
      throw new KeycloakUserUpdateException(keycloakId, error.message);
    }
  }

  /**
   * Delete a Keycloak user
   * @param keycloakId - Keycloak user ID
   */
  async deleteUser(keycloakId: string): Promise<void> {
    await this.ensureAuthenticated();

    try {
      this.logger.log(`Deleting Keycloak user: ${keycloakId}`);

      await this.adminClient.users.del({ id: keycloakId });

      this.logger.log(`Keycloak user deleted successfully: ${keycloakId}`);
    } catch (error) {
      this.logger.error(`Failed to delete Keycloak user: ${keycloakId}`, error.stack);
      throw new KeycloakUserDeletionException(keycloakId, error.message);
    }
  }

  /**
   * Get Keycloak user by email
   * @param email - User email
   * @returns Keycloak user or null
   */
  async getUserByEmail(email: string): Promise<KeycloakUserRepresentation | null> {
    await this.ensureAuthenticated();

    try {
      const users = await this.adminClient.users.find({ email, exact: true });

      if (users.length === 0) {
        return null;
      }

      return users[0] as KeycloakUserRepresentation;
    } catch (error) {
      this.logger.error(`Failed to find Keycloak user by email: ${email}`, error.stack);
      return null;
    }
  }

  /**
   * Get Keycloak user by ID
   * @param keycloakId - Keycloak user ID
   * @returns Keycloak user or null
   */
  async getUserById(keycloakId: string): Promise<KeycloakUserRepresentation | null> {
    await this.ensureAuthenticated();

    try {
      const user = await this.adminClient.users.findOne({ id: keycloakId });
      return user as KeycloakUserRepresentation;
    } catch (error) {
      this.logger.error(`Failed to find Keycloak user by ID: ${keycloakId}`, error.stack);
      return null;
    }
  }

  /**
   * Send password reset email via Keycloak
   * @param keycloakId - Keycloak user ID
   */
  async sendResetPassword(keycloakId: string): Promise<void> {
    await this.ensureAuthenticated();

    try {
      this.logger.log(`Sending password reset email for Keycloak user: ${keycloakId}`);

      await this.adminClient.users.executeActionsEmail({
        id: keycloakId,
        actions: ['UPDATE_PASSWORD'],
        lifespan: 43200, // 12 hours in seconds
      });

      this.logger.log(`Password reset email sent successfully for user: ${keycloakId}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${keycloakId}`, error.stack);
      throw new KeycloakPasswordResetException(keycloakId, error.message);
    }
  }

  /**
   * Send verification email via Keycloak
   * @param keycloakId - Keycloak user ID
   */
  async sendVerifyEmail(keycloakId: string): Promise<void> {
    await this.ensureAuthenticated();

    try {
      this.logger.log(`Sending verification email for Keycloak user: ${keycloakId}`);

      await this.adminClient.users.sendVerifyEmail({
        id: keycloakId,
      });

      this.logger.log(`Verification email sent successfully for user: ${keycloakId}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${keycloakId}`, error.stack);
      throw new KeycloakEmailVerificationException(keycloakId, error.message);
    }
  }

  /**
   * Check if Keycloak integration is configured
   * @returns boolean
   */
  isConfigured(): boolean {
    return !!(this.baseUrl && this.realm && this.clientId && this.clientSecret);
  }
}

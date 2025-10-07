import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '@modules/account/users/repositories/user.repository';
import { User } from '@modules/account/users/entities/user.entity';
import { TenantRepository } from '@modules/account/tenants/repositories/tenant.repository';
import { TenantRole } from '@modules/account/enums/tenant-role.enum';

/**
 * Service responsible for synchronizing Keycloak users with local database
 */
@Injectable()
export class KeycloakSyncService {
  private readonly logger = new Logger(KeycloakSyncService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository,
  ) {}

  /**
   * Sync or create a user from Keycloak JWT payload
   * @param keycloakId - Keycloak user ID (sub claim)
   * @param email - User email
   * @param firstName - Optional first name from Keycloak
   * @param lastName - Optional last name from Keycloak
   * @returns User entity
   */
  async syncUser(
    keycloakId: string,
    email: string,
    firstName?: string,
    lastName?: string,
  ): Promise<User> {
    // Try to find user by keycloakId first
    let user = await this.userRepository.findByKeycloakId(keycloakId);

    if (user) {
      // User exists, update if needed
      // Only sync email (always) and firstName/lastName if they're empty locally
      const needsUpdate =
        user.email !== email ||
        (!user.firstName && firstName) ||
        (!user.lastName && lastName);

      if (needsUpdate) {
        this.logger.log(`Updating user from Keycloak: ${email}`);
        user = await this.userRepository.update(user.id, {
          email,
          firstName: user.firstName || firstName,
          lastName: user.lastName || lastName,
        });
      }

      return user;
    }

    // Try to find by email (migration case: existing user without keycloakId)
    user = await this.userRepository.findByEmail(email);

    if (user) {
      // Link existing user to Keycloak
      this.logger.log(`Linking existing user to Keycloak: ${email}`);
      user = await this.userRepository.update(user.id, {
        keycloakId,
      });
      return user;
    }

    // Create new user
    this.logger.log(`Creating new user from Keycloak: ${email}`);
    user = await this.userRepository.create({
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      keycloakId
    });

    return user;
  }

  /**
   * Find user by Keycloak ID
   * @param keycloakId - Keycloak user ID
   * @returns User entity or null
   */
  async findByKeycloakId(keycloakId: string): Promise<User | null> {
    return this.userRepository.findByKeycloakId(keycloakId);
  }

  /**
   * Sync user and ensure they have a tenant
   * If new user, automatically creates a tenant for them
   * @param keycloakId - Keycloak user ID
   * @param email - User email
   * @param firstName - Optional first name
   * @param lastName - Optional last name
   * @returns User entity and tenant ID
   */
  async syncUserWithAutoTenant(
    keycloakId: string,
    email: string,
    firstName?: string,
    lastName?: string,
  ): Promise<{ user: User; tenantId: string }> {
    // Sync/create user
    const user = await this.syncUser(keycloakId, email, firstName, lastName);

    // Check if user already has tenants
    const userTenants = await this.userRepository.getUserTenants(user.id);

    if (userTenants && userTenants.length > 0) {
      // User has tenants, return the first one where they are OWNER
      const ownerTenant = userTenants.find(t => t.role === TenantRole.OWNER);
      const tenantId = ownerTenant ? ownerTenant.id : userTenants[0].id;

      this.logger.debug(`User ${email} has existing tenants, using tenant ${tenantId}`);
      return { user, tenantId };
    }

    // New user without tenants - create one automatically
    this.logger.log(`Creating automatic tenant for new Keycloak user: ${email}`);

    const tenantName = this.generateTenantName(firstName, lastName, email);
    const tenantSlug = this.generateTenantSlug(email);

    // Create tenant
    const tenant = await this.tenantRepository.create(
      { name: tenantName, slug: tenantSlug },
      user.id,
    );

    this.logger.log(`Tenant ${tenant.id} (${tenant.name}) created for user ${email}`);

    return { user, tenantId: tenant.id };
  }

  /**
   * Generate a user-friendly tenant name
   */
  private generateTenantName(firstName?: string, lastName?: string, email?: string): string {
    if (firstName && lastName) {
      return `${firstName} ${lastName}'s Workspace`;
    }
    if (firstName) {
      return `${firstName}'s Workspace`;
    }
    if (email) {
      const username = email.split('@')[0];
      return `${username}'s Workspace`;
    }
    return 'My Workspace';
  }

  /**
   * Generate a unique tenant slug based on email
   */
  private generateTenantSlug(email: string): string {
    const username = email.split('@')[0].toLowerCase();
    const sanitized = username.replace(/[^a-z0-9]/g, '-');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${sanitized}-${randomSuffix}`;
  }
}

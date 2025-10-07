import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRepository } from '@modules/account/users/repositories/user.repository';
import { TenantRepository } from '@modules/account/tenants/repositories/tenant.repository';
import { InvitationRepository } from '@modules/account/invitations/repositories/invitation.repository';
import { User } from '@modules/account/users/entities/user.entity';
import { TenantUser } from '@modules/account/tenants/entities/tenant-user.entity';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';
import {
  InvitationNotFoundException,
  InvitationAlreadyAcceptedException,
  InvitationExpiredException,
} from '@modules/account/invitations/exceptions/invitation.exceptions';

/**
 * AuthService - Pure Keycloak Architecture
 *
 * This service handles authentication-related operations without generating JWT tokens.
 * All JWT tokens are issued and managed by Keycloak.
 *
 * Key principles:
 * - No token generation (access or refresh) by the API
 * - Keycloak is the single source of truth for authentication
 * - API only manages user-tenant relationships and invitations
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly invitationRepository: InvitationRepository,
  ) {}

  /**
   * Accept a tenant invitation
   *
   * This creates/updates the user-tenant relationship in the local database.
   * The user must then authenticate via Keycloak to receive JWT tokens.
   *
   * @param acceptInvitationDto - Invitation token
   * @returns User information with tenant details
   */
  async acceptInvitation(acceptInvitationDto: AcceptInvitationDto) {
    const invitation = await this.invitationRepository.findByToken(acceptInvitationDto.token);

    if (!invitation) {
      throw new InvitationNotFoundException(acceptInvitationDto.token);
    }

    if (invitation.accepted) {
      throw new InvitationAlreadyAcceptedException();
    }

    if (invitation.isExpired()) {
      throw new InvitationExpiredException();
    }

    // Find user by email (should exist via Keycloak sync)
    let user = await this.userRepository.findByEmail(invitation.email);

    if (!user) {
      // Create minimal user record - will be fully populated when user logs in via Keycloak
      user = await this.dataSource.getRepository(User).save({
        email: invitation.email,
        firstName: null,
        lastName: null,
        keycloakId: null,
      });
    }

    await this.dataSource.transaction(async (manager) => {
      // Add user to tenant or update role
      const existingTenantUser = await manager.findOne(TenantUser, {
        where: {
          userId: user.id,
          tenantId: invitation.tenantId,
        },
      });

      if (existingTenantUser) {
        existingTenantUser.role = invitation.role;
        await manager.save(TenantUser, existingTenantUser);
      } else {
        const tenantUser = manager.create(TenantUser, {
          userId: user.id,
          tenantId: invitation.tenantId,
          role: invitation.role,
        });
        await manager.save(TenantUser, tenantUser);
      }

      // Mark invitation as accepted
      await this.invitationRepository.markAsAccepted(invitation.id);
    });

    // Get tenant information
    const tenant = await this.tenantRepository.findById(invitation.tenantId);

    return {
      message: 'Invitation accepted successfully. Please log in via Keycloak to access the tenant.',
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
      },
      role: invitation.role,
      // Client should redirect to Keycloak login with tenant context
      redirectToKeycloak: true,
      keycloakLoginHint: user.email,
    };
  }
}

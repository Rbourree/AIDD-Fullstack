import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { UserRepository } from '@modules/account/users/repositories/user.repository';
import { TenantRepository } from '@modules/account/tenants/repositories/tenant.repository';
import { InvitationRepository } from '@modules/account/invitations/repositories/invitation.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { User } from '@modules/account/users/entities/user.entity';
import { TenantUser } from '@modules/account/tenants/entities/tenant-user.entity';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';
import { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import {
  AuthInvalidRefreshTokenException,
} from '../exceptions/auth.exceptions';
import {
  InvitationNotFoundException,
  InvitationAlreadyAcceptedException,
  InvitationExpiredException,
} from '@modules/account/invitations/exceptions/invitation.exceptions';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly invitationRepository: InvitationRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async refreshToken(refreshToken: string) {
    try {
      // Verify JWT signature and expiration
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      // Check if token exists in database and is not revoked
      const storedToken = await this.refreshTokenRepository.findByToken(refreshToken);

      if (!storedToken || !storedToken.isValid()) {
        throw new AuthInvalidRefreshTokenException();
      }

      const user = await this.userRepository.findById(payload.sub);

      if (!user) {
        throw new AuthInvalidRefreshTokenException();
      }

      // Preserve the tenantId from the existing token
      const tokens = await this.generateTokens(user.id, payload.tenantId, user.email);

      return tokens;
    } catch (error) {
      throw new AuthInvalidRefreshTokenException();
    }
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    try {
      await this.refreshTokenRepository.revoke(refreshToken);
      return { message: 'Logged out successfully' };
    } catch (error) {
      // Even if revocation fails, return success to prevent info leakage
      return { message: 'Logged out successfully' };
    }
  }

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

    // Use the invitation's tenantId as the active tenant
    const tokens = await this.generateTokens(user.id, invitation.tenantId, user.email);

    return {
      user,
      ...tokens,
    };
  }

  async generateTokens(userId: string, tenantId: string, email: string) {
    const payload: JwtPayload = {
      sub: userId,
      tenantId,
      email,
    };

    const refreshExpiresIn = this.configService.get('jwt.refreshExpiresIn') || '30d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: refreshExpiresIn,
      }),
    ]);

    // Store refresh token in database with expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days default

    await this.refreshTokenRepository.create(userId, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
    };
  }
}

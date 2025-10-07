import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { KeycloakSyncService } from '../services/keycloak-sync.service';
import { TenantRepository } from '@modules/account/tenants/repositories/tenant.repository';

/**
 * Keycloak JWT Strategy
 * Validates JWT tokens issued by Keycloak and syncs users to local database
 */
@Injectable()
export class KeycloakJwtStrategy extends PassportStrategy(Strategy, 'keycloak-jwt') {
  private readonly logger = new Logger(KeycloakJwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private keycloakSyncService: KeycloakSyncService,
    private tenantRepository: TenantRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Validate JWT signature using Keycloak's public keys (JWKS)
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: configService.get<string>('keycloak.jwksUri'),
      }),
      // Validate issuer and audience
      issuer: `${configService.get<string>('keycloak.authServerUrl')}/realms/${configService.get<string>('keycloak.realm')}`,
      audience: 'account', // Keycloak default audience
      algorithms: ['RS256'], // Keycloak uses RS256
    });
  }

  /**
   * Validate Keycloak JWT payload and sync user to local database
   * @param payload - Decoded JWT payload from Keycloak
   * @returns JwtPayload compatible with existing guards/interceptors
   */
  async validate(payload: any): Promise<JwtPayload> {
    this.logger.debug(`Validating Keycloak JWT for user: ${payload.preferred_username || payload.email}`);

    // Extract user information from Keycloak token
    const keycloakId = payload.sub; // Keycloak user ID
    const email = payload.email || payload.preferred_username;
    const firstName = payload.given_name;
    const lastName = payload.family_name;
    const tenantId = payload.tenantId; // Custom claim added in Keycloak

    if (!keycloakId || !email) {
      this.logger.error('Invalid Keycloak token: missing sub or email');
      throw new UnauthorizedException('Invalid token: missing required claims');
    }

    let user;
    let finalTenantId: string;

    // If no tenantId in token, auto-create tenant for new users
    if (!tenantId) {
      this.logger.log(`Keycloak token missing tenantId for user: ${email}, auto-creating tenant if needed`);

      try {
        const result = await this.keycloakSyncService.syncUserWithAutoTenant(
          keycloakId,
          email,
          firstName,
          lastName,
        );
        user = result.user;
        finalTenantId = result.tenantId;

        this.logger.log(`User ${email} authenticated with auto-tenant ${finalTenantId}`);
      } catch (error) {
        this.logger.error(`Failed to sync Keycloak user with auto-tenant: ${email}`, error.stack);
        throw new UnauthorizedException('Failed to synchronize user');
      }
    } else {
      // TenantId provided in token - use existing logic
      try {
        user = await this.keycloakSyncService.syncUser(keycloakId, email, firstName, lastName);
      } catch (error) {
        this.logger.error(`Failed to sync Keycloak user: ${email}`, error.stack);
        throw new UnauthorizedException('Failed to synchronize user');
      }

      // Verify user has access to the tenant specified in the token
      const tenantUser = await this.tenantRepository.getTenantUser(user.id, tenantId);

      if (!tenantUser) {
        this.logger.warn(`User ${email} (${user.id}) does not have access to tenant ${tenantId}`);
        throw new UnauthorizedException('Access to tenant denied or tenant no longer exists');
      }

      finalTenantId = tenantId;
      this.logger.debug(`User ${email} authenticated successfully for tenant ${tenantId}`);
    }

    // Return JwtPayload in the same format as the original JWT strategy
    // This ensures compatibility with existing guards, interceptors, and decorators
    return {
      sub: user.id, // Use local user ID, not Keycloak ID
      tenantId: finalTenantId,
      email,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}

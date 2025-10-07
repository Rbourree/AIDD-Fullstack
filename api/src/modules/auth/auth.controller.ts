import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { UserRepository } from '@modules/account/users/repositories/user.repository';
import { KeycloakAdminService } from './services/keycloak-admin.service';

/**
 * AuthController - Pure Keycloak Architecture
 *
 * Endpoints for authentication-related operations.
 * All JWT token operations are handled by Keycloak.
 *
 * Authentication flow:
 * 1. User authenticates via Keycloak (frontend redirects to Keycloak)
 * 2. Keycloak issues JWT access token
 * 3. Frontend sends JWT token with each API request
 * 4. API validates JWT using KeycloakJwtStrategy (validates with JWKS)
 * 5. Token refresh is handled by Keycloak's refresh token endpoint
 *
 * Note: This API does NOT issue JWT tokens. Only Keycloak does.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
    private readonly keycloakAdminService: KeycloakAdminService,
  ) {}

  @Public()
  @Post('accept-invitation')
  @ApiOperation({
    summary: 'Accept tenant invitation',
    description: 'Accepts an invitation and links the user to a tenant. User must then log in via Keycloak.',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation accepted successfully. Redirect user to Keycloak login.',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired invitation' })
  acceptInvitation(@Body() acceptInvitationDto: AcceptInvitationDto) {
    return this.authService.acceptInvitation(acceptInvitationDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send password reset email via Keycloak',
    description: 'Triggers Keycloak to send a password reset email to the user.',
  })
  @ApiResponse({ status: 200, description: 'Reset password email sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Keycloak integration not configured or user not linked' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    // Find user by email in local database
    const user = await this.userRepository.findByEmail(resetPasswordDto.email);

    if (!user) {
      // Don't reveal if user exists or not (security)
      return {
        message: 'If a user with this email exists, a password reset email has been sent.',
      };
    }

    // Check if user is linked to Keycloak
    if (!user.keycloakId) {
      // User exists locally but not in Keycloak (shouldn't happen in Keycloak-only setup)
      return {
        message: 'If a user with this email exists, a password reset email has been sent.',
      };
    }

    // Check if Keycloak is configured
    if (!this.keycloakAdminService.isConfigured()) {
      return {
        message: 'If a user with this email exists, a password reset email has been sent.',
      };
    }

    // Send reset password email via Keycloak
    try {
      await this.keycloakAdminService.sendResetPassword(user.keycloakId);
    } catch (error) {
      // Log error but return success message (don't leak info)
      console.error('Failed to send reset password email:', error);
    }

    return {
      message: 'If a user with this email exists, a password reset email has been sent.',
    };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile and tenants',
    description: 'Returns the authenticated user profile with their tenant memberships.',
  })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired Keycloak token' })
  async me(@CurrentUser() jwtPayload: JwtPayload) {
    const user = await this.userRepository.findById(jwtPayload.sub);
    const tenants = await this.userRepository.getUserTenants(jwtPayload.sub);

    return {
      user,
      currentTenantId: jwtPayload.tenantId,
      tenants,
    };
  }
}

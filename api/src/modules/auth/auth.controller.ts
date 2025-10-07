import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { UserRepository } from '@modules/account/users/repositories/user.repository';
import { KeycloakAdminService } from './services/keycloak-admin.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
    private readonly keycloakAdminService: KeycloakAdminService,
  ) {}

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Public()
  @Post('accept-invitation')
  @ApiOperation({ summary: 'Accept tenant invitation' })
  @ApiResponse({ status: 200, description: 'Invitation accepted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired invitation' })
  acceptInvitation(@Body() acceptInvitationDto: AcceptInvitationDto) {
    return this.authService.acceptInvitation(acceptInvitationDto);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset email via Keycloak' })
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
  @ApiOperation({ summary: 'Get current user profile and tenants' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { KeycloakJwtStrategy } from './strategies/keycloak-jwt.strategy';
import { KeycloakSyncService } from './services/keycloak-sync.service';
import { KeycloakAdminService } from './services/keycloak-admin.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AccountModule } from '@modules/account/account.module';

@Module({
  imports: [
    PassportModule,
    forwardRef(() => AccountModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    KeycloakJwtStrategy, // Keycloak JWT validation strategy
    KeycloakSyncService, // Keycloak user synchronization
    KeycloakAdminService, // Keycloak admin operations
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService, KeycloakAdminService],
})
export class AuthModule {}

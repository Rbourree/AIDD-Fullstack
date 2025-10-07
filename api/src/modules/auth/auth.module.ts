import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { KeycloakJwtStrategy } from './strategies/keycloak-jwt.strategy';
import { KeycloakSyncService } from './services/keycloak-sync.service';
import { KeycloakAdminService } from './services/keycloak-admin.service';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { RefreshToken } from './entities/refresh-token.entity';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AccountModule } from '@modules/account/account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    PassportModule,
    JwtModule.register({}),
    forwardRef(() => AccountModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // Keep for backwards compatibility during migration
    KeycloakJwtStrategy, // New Keycloak strategy
    KeycloakSyncService, // Keycloak user synchronization
    KeycloakAdminService, // Keycloak admin operations
    RefreshTokenRepository,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService, KeycloakAdminService, TypeOrmModule],
})
export class AuthModule {}

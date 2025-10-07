import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { User } from './users/entities/user.entity';
import { Tenant } from './tenants/entities/tenant.entity';
import { TenantUser } from './tenants/entities/tenant-user.entity';
import { Invitation } from './invitations/entities/invitation.entity';

// Services
import { UsersService } from './users/services/users.service';
import { TenantsService } from './tenants/services/tenants.service';

// Repositories
import { UserRepository } from './users/repositories/user.repository';
import { TenantRepository } from './tenants/repositories/tenant.repository';
import { InvitationRepository } from './invitations/repositories/invitation.repository';

// Controllers
import { UsersController } from './users/controllers/users.controller';
import { TenantsController } from './tenants/controllers/tenants.controller';

// External modules
import { AuthModule } from '@modules/auth/auth.module';
import { MailModule } from '@common/integrations/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant, TenantUser, Invitation]),
    forwardRef(() => AuthModule),
    MailModule,
  ],
  controllers: [UsersController, TenantsController],
  providers: [
    UsersService,
    TenantsService,
    UserRepository,
    TenantRepository,
    InvitationRepository,
  ],
  exports: [
    UsersService,
    TenantsService,
    UserRepository,
    TenantRepository,
    InvitationRepository,
    TypeOrmModule,
  ],
})
export class AccountModule {}

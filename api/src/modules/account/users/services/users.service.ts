import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PaginationDto } from '@common/dtos/pagination.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import {
  UserNotFoundException,
  UserEmailAlreadyExistsException,
  UserNoTenantAccessException,
} from '../exceptions/user.exceptions';
import { KeycloakAdminService } from '@modules/auth/services/keycloak-admin.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly keycloakAdminService: KeycloakAdminService,
  ) {}

  async findMe(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    return user;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<User>> {
    const { page, limit, search } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userRepository.findAll({ skip, take: limit, search }),
      this.userRepository.count(search),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundException(id);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundException(id);
    }

    // Check if email is being changed and if it's already in use
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(updateUserDto.email);

      if (existingUser) {
        throw new UserEmailAlreadyExistsException(updateUserDto.email);
      }
    }

    // Update user in local database
    const updatedUser = await this.userRepository.update(id, updateUserDto);

    // Bidirectional sync: Update Keycloak if user is linked to Keycloak
    if (updatedUser.keycloakId && this.keycloakAdminService.isConfigured()) {
      try {
        this.logger.log(
          `Synchronizing user profile to Keycloak: ${updatedUser.keycloakId} (${updatedUser.email})`,
        );

        await this.keycloakAdminService.updateUser(updatedUser.keycloakId, {
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
        });

        this.logger.log(`Successfully synchronized user to Keycloak: ${updatedUser.keycloakId}`);
      } catch (error) {
        // Log error but don't fail the request
        // Local database is source of truth for profile data
        this.logger.warn(
          `Failed to sync user to Keycloak (non-blocking): ${updatedUser.keycloakId}`,
          error.stack,
        );
      }
    }

    return updatedUser;
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundException(id);
    }

    await this.userRepository.delete(id);

    return { message: 'User deleted successfully' };
  }

  async getUserTenants(userId: string) {
    return this.userRepository.getUserTenants(userId);
  }

  async switchTenant(userId: string, tenantId: string): Promise<{ tenantId: string }> {
    const hasAccess = await this.userRepository.hasTenantAccess(userId, tenantId);

    if (!hasAccess) {
      throw new UserNoTenantAccessException(tenantId);
    }

    return { tenantId };
  }
}
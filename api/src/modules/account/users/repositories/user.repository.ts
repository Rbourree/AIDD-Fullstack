import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../entities/user.entity';
import { TenantUser } from '@modules/account/tenants/entities/tenant-user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface FindAllUsersOptions {
  skip?: number;
  take?: number;
  search?: string;
}

export interface TenantWithRole {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  role: string;
}

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TenantUser)
    private readonly tenantUserRepository: Repository<TenantUser>,
  ) {}

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['tenantUsers', 'tenantUsers.tenant'],
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['tenantUsers', 'tenantUsers.tenant'],
    });
  }

  /**
   * Find user by Keycloak ID
   */
  async findByKeycloakId(keycloakId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { keycloakId },
      relations: ['tenantUsers', 'tenantUsers.tenant'],
    });
  }


  /**
   * Find all users with pagination and filtering
   */
  async findAll(options: FindAllUsersOptions): Promise<User[]> {
    const { skip, take, search } = options;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC');

    if (search) {
      queryBuilder.where(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (skip !== undefined) {
      queryBuilder.skip(skip);
    }

    if (take !== undefined) {
      queryBuilder.take(take);
    }

    return queryBuilder.getMany();
  }

  /**
   * Count users with filtering
   */
  async count(search?: string): Promise<number> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return queryBuilder.getCount();
  }

  /**
   * Create user
   */
  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  /**
   * Update user
   */
  async update(id: string, dto: UpdateUserDto | Partial<User>): Promise<User> {
    await this.userRepository.update(id, dto);
    return this.findById(id);
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  /**
   * Get user's tenants with roles
   */
  async getUserTenants(userId: string): Promise<TenantWithRole[]> {
    const tenantUsers = await this.tenantUserRepository.find({
      where: { userId },
      relations: ['tenant'],
      order: { createdAt: 'ASC' },
    });

    return tenantUsers.map((tu) => ({
      id: tu.tenant.id,
      name: tu.tenant.name,
      slug: tu.tenant.slug,
      createdAt: tu.tenant.createdAt,
      role: tu.role,
    }));
  }

  /**
   * Check if user has access to tenant
   */
  async hasTenantAccess(userId: string, tenantId: string): Promise<boolean> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: { userId, tenantId },
    });

    return !!tenantUser;
  }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1759497466006 implements MigrationInterface {
    name = 'Init1759497466006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "invitations_tenantId_fkey"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "invitations_inviterId_fkey"`);
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "items_tenantId_fkey"`);
        await queryRunner.query(`ALTER TABLE "tenant_users" DROP CONSTRAINT "tenant_users_tenantId_fkey"`);
        await queryRunner.query(`ALTER TABLE "tenant_users" DROP CONSTRAINT "tenant_users_userId_fkey"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_userId_fkey"`);
        await queryRunner.query(`ALTER TABLE "tenant_users" DROP CONSTRAINT "tenant_users_tenantId_userId_key"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "acceptedAt"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "inviterId"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "revokedAt"`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD "accepted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD "invitedBy" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tenant_users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "revoked" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "role"`);
        await queryRunner.query(`CREATE TYPE "public"."invitations_role_enum" AS ENUM('OWNER', 'ADMIN', 'MEMBER')`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD "role" "public"."invitations_role_enum" NOT NULL DEFAULT 'MEMBER'`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "createdAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "items" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "items" ALTER COLUMN "createdAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "items" ALTER COLUMN "updatedAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "createdAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "updatedAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenant_users" DROP COLUMN "role"`);
        await queryRunner.query(`CREATE TYPE "public"."tenant_users_role_enum" AS ENUM('OWNER', 'ADMIN', 'MEMBER')`);
        await queryRunner.query(`ALTER TABLE "tenant_users" ADD "role" "public"."tenant_users_role_enum" NOT NULL DEFAULT 'MEMBER'`);
        await queryRunner.query(`ALTER TABLE "tenant_users" ALTER COLUMN "createdAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "createdAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "createdAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updatedAt" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_610102b60fea1455310ccd299d" ON "refresh_tokens" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4542dd2f38a61354a040ba9fd5" ON "refresh_tokens" ("token") `);
        await queryRunner.query(`ALTER TABLE "tenant_users" ADD CONSTRAINT "UQ_8fa3e63dcfe2fe25531f8849e45" UNIQUE ("userId", "tenantId")`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_6dda79f83eec12994a955ad68c9" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_b6c9f56adddc26272a8d8643f59" FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_32406202861088bf509dfae09f4" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenant_users" ADD CONSTRAINT "FK_5c0a747551be06a29ac8196037e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenant_users" ADD CONSTRAINT "FK_b60b5094f416190c9b3103cba2a" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`);
        await queryRunner.query(`ALTER TABLE "tenant_users" DROP CONSTRAINT "FK_b60b5094f416190c9b3103cba2a"`);
        await queryRunner.query(`ALTER TABLE "tenant_users" DROP CONSTRAINT "FK_5c0a747551be06a29ac8196037e"`);
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_32406202861088bf509dfae09f4"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_b6c9f56adddc26272a8d8643f59"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_6dda79f83eec12994a955ad68c9"`);
        await queryRunner.query(`ALTER TABLE "tenant_users" DROP CONSTRAINT "UQ_8fa3e63dcfe2fe25531f8849e45"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4542dd2f38a61354a040ba9fd5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_610102b60fea1455310ccd299d"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updatedAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "createdAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ALTER COLUMN "createdAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenant_users" ALTER COLUMN "createdAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenant_users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."tenant_users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "tenant_users" ADD "role" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "updatedAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "createdAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "items" ALTER COLUMN "updatedAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "items" ALTER COLUMN "createdAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "items" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "invitations" ALTER COLUMN "createdAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."invitations_role_enum"`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD "role" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "revoked"`);
        await queryRunner.query(`ALTER TABLE "tenant_users" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "invitedBy"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "accepted"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "revokedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD "inviterId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD "acceptedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_tenantId_userId_key" UNIQUE ("tenantId", "userId")`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "invitations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

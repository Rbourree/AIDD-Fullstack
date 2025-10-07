import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1759508562807 implements MigrationInterface {
    name = 'Init1759508562807'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying`);
    }

}

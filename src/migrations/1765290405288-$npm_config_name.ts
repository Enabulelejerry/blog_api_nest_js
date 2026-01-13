import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1765290405288 implements MigrationInterface {
    name = ' $npmConfigName1765290405288'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tags" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "createdAt"`);
    }

}

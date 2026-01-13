import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1768214766002 implements MigrationInterface {
    name = ' $npmConfigName1768214766002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "description" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ALTER COLUMN "description" DROP DEFAULT`);
    }

}

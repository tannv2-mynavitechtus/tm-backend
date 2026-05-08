import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersAndTasks1746700000000 implements MigrationInterface {
  name = 'CreateUsersAndTasks1746700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
          CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'USER');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasks_status_enum') THEN
          CREATE TYPE "public"."tasks_status_enum" AS ENUM(
            'TODO',
            'DOING',
            'RESOLVED',
            'READY_TO_TEST',
            'READY_TO_STAGING',
            'CLOSE'
          );
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasks_priority_enum') THEN
          CREATE TYPE "public"."tasks_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "fullName" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" SERIAL NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'TODO',
        "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'MEDIUM',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "assigneeId" integer,
        "reporterId" integer,
        CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'FK_tasks_assignee'
        ) THEN
          ALTER TABLE "tasks"
          ADD CONSTRAINT "FK_tasks_assignee"
          FOREIGN KEY ("assigneeId") REFERENCES "users"("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'FK_tasks_reporter'
        ) THEN
          ALTER TABLE "tasks"
          ADD CONSTRAINT "FK_tasks_reporter"
          FOREIGN KEY ("reporterId") REFERENCES "users"("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tasks_assigneeId" ON "tasks" ("assigneeId")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tasks_reporterId" ON "tasks" ("reporterId")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tasks_status" ON "tasks" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_tasks_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_tasks_reporterId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_tasks_assigneeId"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "FK_tasks_reporter"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "FK_tasks_assignee"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tasks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tasks_priority_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tasks_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}

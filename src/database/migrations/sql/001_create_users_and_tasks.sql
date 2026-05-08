DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
    CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'USER');
  END IF;
END
$$;

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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasks_priority_enum') THEN
    CREATE TYPE "public"."tasks_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');
  END IF;
END
$$;

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
);

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
);

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

CREATE INDEX IF NOT EXISTS "IDX_tasks_assigneeId" ON "tasks" ("assigneeId");
CREATE INDEX IF NOT EXISTS "IDX_tasks_reporterId" ON "tasks" ("reporterId");
CREATE INDEX IF NOT EXISTS "IDX_tasks_status" ON "tasks" ("status");

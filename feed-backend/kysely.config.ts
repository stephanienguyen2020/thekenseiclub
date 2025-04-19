import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { defineConfig } from "kysely-ctl";

export const dialect =  new PostgresDialect({
    pool: new Pool({
      database: 'sui',
      host: 'localhost',
      user: 'postgres',
      password: 'password',
      port: 5432,
      max: 10,
    }),
  });

export default defineConfig({
  dialect,
  migrations: {
    migrationFolder: "./src/db/migrations"
  }
});
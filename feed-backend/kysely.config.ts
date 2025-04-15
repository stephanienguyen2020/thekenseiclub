import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { defineConfig } from "kysely-ctl";

export const dialect =  new PostgresDialect({
    pool: new Pool({
      host: 'localhost',
      database: 'your_db',
      user: 'your_user',
      password: 'your_pass',
    }),
  });

export default defineConfig({
  dialect,
  migrations: {
    migrationFolder: "./src/db/migrations"
  }
});
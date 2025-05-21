import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { defineConfig } from "kysely-ctl";
import 'dotenv/config';

// Get database configuration from environment variables with fallbacks
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = parseInt(process.env.DB_PORT || "5432", 10);
const dbName = process.env.DB_NAME || "postgres";
const dbUser = process.env.DB_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD || "password";
const dbPoolMax = parseInt(process.env.DB_POOL_MAX || "10", 10);

export const dialect = new PostgresDialect({
  pool: new Pool({
    database: dbName,
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    port: dbPort,
    max: dbPoolMax,
  }),
});

export default defineConfig({
  dialect,
  migrations: {
    migrationFolder: "./src/db/migrations"
  }
});
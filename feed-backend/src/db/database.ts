import { Pool } from "pg";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { DB } from "./kysely-types/postgres";

// Get database configuration from environment variables with fallbacks
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = parseInt(process.env.DB_PORT || "5432", 10);
const dbName = process.env.DB_NAME || "postgres";
const dbUser = process.env.DB_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD || "password";
const dbPoolMax = parseInt(process.env.DB_POOL_MAX || "10", 10);

const dialect = new PostgresDialect({
  pool: new Pool({
    database: dbName,
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    port: dbPort,
    max: dbPoolMax,
  }),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()],
});

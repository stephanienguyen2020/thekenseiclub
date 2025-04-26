import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("users")
    .addColumn("id", "bigserial", (col) => col.primaryKey().notNull())
    .addColumn("username", "varchar", (col) => col.notNull())
    .addColumn("sui_address", "varchar", (col) => col.notNull())
    .addColumn("profile_picture_url", "text", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("coins")
    .addColumn("id", "varchar", (col) => col.primaryKey().notNull())
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("symbol", "varchar", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("image_url", "text", (col) => col.notNull())
    .addColumn("address", "varchar", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now
        ()`),
    )
    .execute();

  await db.schema
    .createTable("cursors")
    .addColumn("id", "varchar", (col) => col.primaryKey().notNull())
    .addColumn("event_seq", "varchar", (col) => col.notNull())
    .addColumn("tx_digest", "varchar", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("bonding_curve")
    .addColumn("id", "varchar", (col) => col.primaryKey().notNull())
    .addColumn("issuer", "varchar", (col) => col.notNull())
    .addColumn("treasury_cap", "varchar", (col) => col.notNull())
    .addColumn("coin_metadata", "varchar", (col) =>
      col.references("coins.id").notNull(),
    )
    .addColumn("migration_target", "varchar", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("posts")
    .addColumn("id", "bigserial", (col) => col.primaryKey().notNull())
    .addColumn("user_id", "bigint", (col) => col.notNull())
    .addColumn("coin_id", "varchar", (col) => col.references("coins.id"))
    .addColumn("content", "varchar", (col) => col.notNull())
    .addColumn(
      "media_urls",
      sql`text
        []`,
    )
    .addColumn("created_at", "timestamp", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("comments")
    .addColumn("id", "bigserial", (col) => col.primaryKey().notNull())
    .addColumn("user_id", "bigint", (col) =>
      col.references("users.id").notNull(),
    )
    .addColumn("post_id", "bigint", (col) =>
      col.references("posts.id").notNull(),
    )
    .addColumn("content", "varchar", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("likes")
    .addColumn("id", "bigserial", (col) => col.primaryKey().notNull())
    .addColumn("user_id", "bigint", (col) =>
      col.references("users.id").notNull(),
    )
    .addColumn("post_id", "bigint", (col) =>
      col.references("posts.id").notNull(),
    )
    .addColumn("created_at", "timestamp", (col) => col.notNull())
    .addUniqueConstraint("likes_unique", ["user_id", "post_id"])
    .execute();

  await db.schema
    .createTable("images")
    .addColumn("image_name", "varchar", (col) => col.notNull())
    .addColumn("post_id", "bigserial", (col) =>
      col.references("posts.id").notNull(),
    )
    .addColumn("image_path", "varchar", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("raw_prices")
    .addColumn("bonding_curve_id", "varchar", (col) =>
      col.references("bonding_curve.id").notNull(),
    )
    .addColumn("timestamp", "timestamp", (col) => col.notNull())
    .addColumn("price", "varchar", (col) => col.notNull())
    .addColumn("amount_in", "varchar", (col) => col.notNull())
    .addColumn("amount_out", "varchar", (col) => col.notNull())
    .addColumn("direction", "varchar", (col) => col.notNull())
    .execute();

  await sql`SELECT create_hypertable('raw_prices', by_range('timestamp'));`.execute(
    db,
  );

  await sql`CREATE INDEX ON raw_prices ("bonding_curve_id", "timestamp");`.execute(
    db,
  );

  await sql`ALTER TABLE raw_prices SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = '"bonding_curve_id"',
    timescaledb.compress_orderby = 'timestamp DESC'
  )`.execute(db);

  await sql`SELECT add_compression_policy('raw_prices', INTERVAL '5 seconds')`.execute(
    db,
  );

  // await sql`CREATE MATERIALIZED VIEW secondly_prices_stats
  // WITH (timescaledb.continuous) AS
  // SELECT
  //     time_bucket('5 seconds', timestamp) AS bucket,
  //     'bonding_curve_id',
  //     MAX(price) AS high,
  //     FIRST(price, timestamp) AS open,
  //     LAST(price, timestamp) AS close,
  //     MIN(price) AS low
  // FROM raw_prices
  // GROUP BY bucket;`.execute(db);

  // await sql`SELECT add_continuous_aggregate_policy('secondly_prices_stats',
  //     start_offset => INTERVAL '10 seconds',
  //     end_offset => INTERVAL '5 seconds',
  //     schedule_interval => INTERVAL '5 seconds')`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Reverse the table creations if needed.
  await db.schema.dropTable("raw_prices").execute();
  await db.schema.dropTable("cursors").execute();
  await db.schema.dropTable("comments").execute();
  await db.schema.dropTable("images").execute();
  await db.schema.dropTable("likes").execute();
  await db.schema.dropTable("posts").execute();
  await db.schema.dropTable("users").execute();
  await db.schema.dropTable("bonding_curve").execute();
  await db.schema.dropTable("coins").execute();
}

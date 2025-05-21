import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("users")
    .addColumn("sui_address", "varchar", (col) => col.primaryKey().notNull())
    .addColumn("username", "varchar", (col) => col.notNull())
    .addColumn("profile_picture_url", "text", (col) => col.notNull())
    .addUniqueConstraint("username_unique", ["username"])
    .execute();

  await db.schema
    .createTable("coins")
    .addColumn("id", "varchar", (col) => col.primaryKey().notNull())
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("symbol", "varchar", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("logo", "text", (col) => col.notNull())
    .addColumn("address", "varchar", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now
        ()`)
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
      col.references("coins.id").notNull()
    )
    .addColumn("migration_target", "varchar", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("posts")
    .addColumn("id", "bigserial", (col) => col.primaryKey().notNull())
    .addColumn("user_id", "varchar", (col) => col.notNull())
    .addColumn("coin_id", "varchar", (col) => col.references("coins.id"))
    .addColumn("content", "varchar", (col) => col.notNull())
    .addColumn(
      "media_urls",
      sql`text
        []`
    )
    .addColumn("created_at", "timestamp", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("comments")
    .addColumn("id", "bigserial", (col) => col.primaryKey().notNull())
    .addColumn("user_id", "varchar", (col) =>
      col.references("users.sui_address").notNull()
    )
    .addColumn("post_id", "bigint", (col) =>
      col.references("posts.id").notNull()
    )
    .addColumn("content", "varchar", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("likes")
    .addColumn("id", "bigserial", (col) => col.primaryKey().notNull())
    .addColumn("user_id", "varchar", (col) =>
      col.references("users.sui_address").notNull()
    )
    .addColumn("post_id", "bigint", (col) =>
      col.references("posts.id").notNull()
    )
    .addColumn("created_at", "timestamp", (col) => col.notNull())
    .addUniqueConstraint("likes_unique", ["user_id", "post_id"])
    .execute();

  await db.schema
    .createTable("re_tweets")
    .addColumn("id", "bigserial", (col) => col.primaryKey().notNull())
    .addColumn("user_id", "varchar", (col) =>
      col.references("users.sui_address").notNull()
    )
    .addColumn("post_id", "bigint", (col) =>
      col.references("posts.id").notNull()
    )
    .addColumn("created_at", "timestamp", (col) => col.notNull())
    .addUniqueConstraint("reTweets_unique", ["user_id", "post_id"])
    .execute();

  await db.schema
    .createTable("save_posts")
    .addColumn("id", "bigserial", (col) => col.primaryKey().notNull())
    .addColumn("user_id", "varchar", (col) =>
      col.references("users.sui_address").notNull()
    )
    .addColumn("post_id", "bigint", (col) =>
      col.references("posts.id").notNull()
    )
    .addColumn("created_at", "timestamp", (col) => col.notNull())
    .addUniqueConstraint("savePosts_unique", ["user_id", "post_id"])
    .execute();

  await db.schema
    .createTable("images")
    .addColumn("image_name", "varchar", (col) => col.notNull())
    .addColumn("image_path", "varchar", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("raw_prices")
    .addColumn("bonding_curve_id", "varchar", (col) =>
      col.references("bonding_curve.id").notNull()
    )
    .addColumn("timestamp", "timestamp", (col) => col.notNull())
    .addColumn("price", "float8", (col) => col.notNull())
    .addColumn("amount_in", "float8", (col) => col.notNull())
    .addColumn("amount_out", "float8", (col) => col.notNull())
    .addColumn("direction", "varchar", (col) => col.notNull())
    .addColumn("sender", "varchar", (col) => col.notNull())
    .execute();

  await sql`SELECT create_hypertable('raw_prices', by_range('timestamp'));`.execute(
    db
  );

  await sql`CREATE INDEX ON raw_prices ("bonding_curve_id", "timestamp");`.execute(
    db
  );

  await sql`ALTER TABLE raw_prices SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = '"bonding_curve_id"',
    timescaledb.compress_orderby = 'timestamp DESC'
  )`.execute(db);

  await sql`SELECT add_compression_policy('raw_prices', INTERVAL '5 seconds')`.execute(
    db
  );

  // --- PORTFOLIOS TABLE MIGRATION ---
  await db.schema
    .createTable("portfolios")
    .addColumn("user_address", "varchar", (col) => col.notNull())
    .addColumn("bonding_curve_id", "varchar", (col) =>
      col.references("bonding_curve.id").notNull()
    )
    .addColumn("amount", "float8", (col) => col.notNull())
    .addColumn("timestamp", "timestamp", (col) => col.notNull())
    .execute();

  await sql`SELECT create_hypertable('portfolios', by_range('timestamp'));`.execute(db);
  await sql`CREATE INDEX ON portfolios ("user_address", "timestamp");`.execute(db);
  await sql`CREATE INDEX ON portfolios ("bonding_curve_id", "timestamp");`.execute(db);
  await sql`ALTER TABLE portfolios SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = '"user_address", "bonding_curve_id"',
    timescaledb.compress_orderby = 'timestamp DESC'
  )`.execute(db);
  await sql`SELECT add_compression_policy('portfolios', INTERVAL '1 day')`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Reverse the table creations if needed.
  await db.schema.dropTable("portfolios").execute();
  await db.schema.dropTable("raw_prices").execute();
  await db.schema.dropTable("cursors").execute();
  await db.schema.dropTable("comments").execute();
  await db.schema.dropTable("images").execute();
  await db.schema.dropTable("likes").execute();
  await db.schema.dropTable("re_tweets").execute();
  await db.schema.dropTable("save_posts").execute();
  await db.schema.dropTable("posts").execute();
  await db.schema.dropTable("users").execute();
  await db.schema.dropTable("bonding_curve").execute();
  await db.schema.dropTable("coins").execute();
}

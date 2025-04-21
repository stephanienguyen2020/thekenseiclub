// File: src/db/migrations/1744680765801_create_tables.ts
import {Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('cursors')
        .addColumn('id', 'varchar', col => col.primaryKey().notNull())
        .addColumn('eventSeq', 'varchar', col => col.notNull())
        .addColumn('txDigest', 'varchar', col => col.notNull())
        .execute()

    await db.schema
        .createTable('raw_prices')
        .addColumn('bondingCurveId', 'varchar', col => col.notNull())
        .addColumn('timestamp', 'timestamp', col => col.notNull())
        .addColumn('price', 'varchar', col => col.notNull())
        .addColumn('amountIn', 'varchar', col => col.notNull())
        .addColumn('amountOut', 'varchar', col => col.notNull())
        .addColumn('direction', 'varchar', col => col.notNull())
        .execute();

    await sql`SELECT create_hypertable('raw_prices', by_range('timestamp'));`
        .execute(db);

    await db.schema
        .createTable('bonding_curve')
        .addColumn('bondingCurveId', 'varchar', col => col.primaryKey().notNull())
        .addColumn('issuer', 'varchar', col => col.notNull())
        .addColumn('treasuryCap', 'varchar', col => col.notNull())
        .addColumn('coinMetadata', 'varchar', col => col.notNull())
        .addColumn('migrationTarget', 'varchar', col => col.notNull())
        .execute()

    await db.schema
        .createTable('users')
        .addColumn('id', 'bigserial', col => col.primaryKey().notNull())
        .addColumn('username', 'varchar', col => col.notNull())
        .addColumn('sui_address', 'varchar', col => col.notNull())
        .addColumn('profile_picture_url', 'text', col => col.notNull())
        .execute()

    await db.schema
        .createTable('posts')
        .addColumn('id', 'bigserial', col => col.primaryKey().notNull())
        .addColumn('user_id', 'bigint', col => col.notNull())
        .addColumn('coin_id', 'varchar')
        .addColumn('content', 'varchar', col => col.notNull())
        .addColumn('media_urls', sql`text
        []`)
        .addColumn('created_at', 'timestamp', col => col.notNull())
        .execute()

    await db.schema
        .createTable('comments')
        .addColumn('id', 'bigserial', col => col.primaryKey().notNull())
        .addColumn('user_id', 'bigint', col => col.notNull())
        .addColumn('post_id', 'bigint', col => col.notNull())
        .addColumn('content', 'varchar', col => col.notNull())
        .addColumn('created_at', 'timestamp', col => col.notNull())
        .execute()

    await db.schema
        .createTable('likes')
        .addColumn('id', 'bigserial', col => col.primaryKey().notNull())
        .addColumn('user_id', 'bigint', col => col.notNull())
        .addColumn('post_id', 'bigint', col => col.notNull())
        .addColumn('created_at', 'timestamp', col => col.notNull())
        .addUniqueConstraint('likes_unique', ['user_id', 'post_id'])
        .execute()

    await db.schema
        .createTable('images')
        .addColumn('imageName', 'varchar', col => col.notNull())
        .addColumn('postId', 'varchar', col => col.notNull())
        .addColumn('imagePath', 'varchar', col => col.notNull())
        .execute()

    await db.schema
        .createTable('coins')
        .addColumn('id', 'varchar', col => col.primaryKey().notNull())
        .addColumn('name', 'varchar', col => col.notNull())
        .addColumn('symbol', 'varchar', col => col.notNull())
        .addColumn('description', 'text', col => col.notNull())
        .addColumn('imageUrl', 'text', col => col.notNull())
        .addColumn('address', 'varchar', col => col.notNull())
        .addColumn('created_at', 'timestamp', col => col.notNull().defaultTo(sql`now
        ()`))
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    // Reverse the table creations if needed.
    await db.schema.dropTable('coins').execute()
    await db.schema.dropTable('images').execute()
    await db.schema.dropTable('sell_events').execute()
    await db.schema.dropTable('buy_events').execute()
    await db.schema.dropTable('cursors').execute()
    await db.schema.dropTable('raw_prices').execute()
    await db.schema.dropTable('bonding_curve').execute()
    await db.schema.dropTable('users').execute()
    await db.schema.dropTable('posts').execute()
    await db.schema.dropTable('comments').execute()
    await db.schema.dropTable('likes').execute()
}

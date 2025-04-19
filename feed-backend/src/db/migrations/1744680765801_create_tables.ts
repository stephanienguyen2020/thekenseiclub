// File: src/db/migrations/1744680765801_create_tables.ts
import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('cursors')
        .addColumn('id', 'varchar', col => col.primaryKey().notNull())
        .addColumn('eventSeq', 'varchar', col => col.notNull())
        .addColumn('txDigest', 'varchar', col => col.notNull())
        .execute()

    await db.schema
        .createTable('buy_events')
        .addColumn('id', 'varchar', col => col.primaryKey().notNull())
        .addColumn('timestamp', 'timestamp', col => col.notNull())
        .addColumn('buyer', 'varchar', col => col.notNull())
        .addColumn('coinType', 'varchar', col => col.notNull())
        .addColumn('amountIn', 'bigint', col => col.notNull())
        .addColumn('tokenOut', 'bigint', col => col.notNull())
        .addColumn('txDigest', 'varchar', col => col.notNull())
        .execute()

    await db.schema
        .createTable('sell_events')
        .addColumn('id', 'varchar', col => col.primaryKey().notNull())
        .addColumn('timestamp', 'timestamp', col => col.notNull())
        .addColumn('seller', 'varchar', col => col.notNull())
        .addColumn('coinType', 'varchar', col => col.notNull())
        .addColumn('tokenIn', 'bigint', col => col.notNull())
        .addColumn('amountOut', 'bigint', col => col.notNull())
        .addColumn('txDigest', 'varchar', col => col.notNull())
        .execute()

    await db.schema
        .createTable('raw_prices')
        .addColumn('id', 'varchar', col => col.primaryKey().notNull())
        .addColumn('bondingCurveId', 'varchar', col => col.notNull())
        .addColumn('timestamp', 'timestamp', col => col.notNull())
        .addColumn('price', 'varchar', col => col.notNull())
        .addColumn('amountIn', 'varchar', col => col.notNull())
        .addColumn('amountOut', 'varchar', col => col.notNull())
        .addColumn('direction', 'varchar', col => col.notNull())
        .execute()

    await db.schema
        .createTable('bonding_curve')
        .addColumn('bondingCurveId', 'varchar', col => col.primaryKey().notNull())
        .addColumn('issuer', 'varchar', col => col.notNull())
        .addColumn('treasuryCap', 'varchar', col => col.notNull())
        .addColumn('coinMetadata', 'varchar', col => col.notNull())
        .addColumn('migrationTarget', 'varchar', col => col.notNull())
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    // Reverse the table creations if needed.
    await db.schema.dropTable('price_snapshots').execute()
    await db.schema.dropTable('sell_events').execute()
    await db.schema.dropTable('buy_events').execute()
    await db.schema.dropTable('cursors').execute()
}
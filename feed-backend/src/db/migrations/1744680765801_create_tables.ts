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
        .createTable('price_snapshots')
        .addColumn('id', 'serial', col => col.primaryKey().notNull())
        .addColumn('coinType', 'varchar', col => col.notNull())
        .addColumn('timestamp', 'timestamp', col => col.notNull())
        .addColumn('open', 'numeric', col => col.notNull())
        .addColumn('high', 'numeric', col => col.notNull())
        .addColumn('low', 'numeric', col => col.notNull())
        .addColumn('close', 'numeric', col => col.notNull())
        .addColumn('volume', 'numeric', col => col.notNull())
        .execute()

    await db.schema
        .createTable('raw_prices')
        .addColumn('id', 'varchar', col => col.primaryKey().notNull())
        .addColumn('bondingCurveId', 'varchar', col => col.notNull())
        .addColumn('timestamp', 'timestamp', col => col.primaryKey().notNull())
        .addColumn('price', 'numeric', col => col.notNull())
        .addColumn('amountIn', 'numeric', col => col.notNull())
        .addColumn('amountOut', 'numeric', col => col.notNull())
        .addColumn('direction', 'varchar', col => col.notNull())
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    // Reverse the table creations if needed.
    await db.schema.dropTable('price_snapshots').execute()
    await db.schema.dropTable('sell_events').execute()
    await db.schema.dropTable('buy_events').execute()
    await db.schema.dropTable('cursors').execute()
}
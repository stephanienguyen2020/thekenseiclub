import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("coin_tribes")
    .addColumn("id", "bigserial", (col) => col.primaryKey().notNull())
    .addColumn("coin_id", "varchar", (col) =>
      col.references("coins.id").notNull()
    )
    .addColumn("tribe", "varchar", (col) => col.notNull())
    .addUniqueConstraint("coin_tribes_unique", ["coin_id"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("coin_tribes").execute();
}

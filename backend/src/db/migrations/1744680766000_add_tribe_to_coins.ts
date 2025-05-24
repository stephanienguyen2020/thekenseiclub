import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("coins")
    .addColumn("tribe", "varchar", (col) => col.defaultTo("wildcards"))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("coins").dropColumn("tribe").execute();
}

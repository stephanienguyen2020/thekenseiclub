// File: src/indexer/price-snapshot.ts
import { db } from "../db/database"

export async function insertPriceSnapshots() {
    const now = new Date()
    const interval = 15 * 60 * 1000 // 15 minutes in ms
    const roundedTimestamp = new Date(Math.floor(now.getTime() / interval) * interval)

    const coinTypes = [
        "0xe8207281d6fdad51aebaed62ae766340bcf29944eb979db44e1afb9c16c4c0f9::keke::KEKE"
    ]
    for (const coinType of coinTypes) {
        const existing = await db
            .selectFrom('price_snapshots')
            .select('id')
            .where('coinType', '=', coinType)
            .where('timestamp', '=', roundedTimestamp)
            .executeTakeFirst()

        if (existing) {
            console.log(`[skip] Candle already exists for ${coinType} at ${roundedTimestamp}`)
            continue
        }

        // Generate random OHLC values for demo purposes.
        const open = Math.random() * 100
        const high = open + Math.random() * 10
        const low = open - Math.random() * 10
        const close = low + Math.random() * (high - low)
        const volume = Math.random() * 1000

        await db
            .insertInto('price_snapshots')
            .values({
                coinType,
                timestamp: roundedTimestamp,
                open,
                high,
                low,
                close,
                volume,
            })
            .execute()

        console.log(`[inserted] ${coinType} - O:${open.toFixed(2)} H:${high.toFixed(2)} L:${low.toFixed(2)} C:${close.toFixed(2)} V:${volume.toFixed(2)}`)
    }
}
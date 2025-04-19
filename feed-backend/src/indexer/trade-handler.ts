// File: src/indexer/trade-handler.ts
import {db} from '../db/database'
import {RawPrice} from '../db/types'
import {SuiEvent} from '@mysten/sui/client'

export const handleRawPriceEvent = async (events: SuiEvent[], type: string) => {
    for (const event of events) {
        if (!event.type.startsWith(type)) throw new Error('Invalid event module origin');

        const payload = event.parsedJson as {
            price: number;
            amount_in: number;
            amount_out: number;
            bonding_curve_id: string;
            direction: string;
        }

        if (event.type.endsWith('::BuyEvent')) {
            payload.direction = 'BUY';
        }

        if (event.type.endsWith('::SellEvent')) {
            payload.direction = 'SELL';
        }


        const rawPriceData: RawPrice = {
            id: event.id.txDigest,
            bondingCurveId: payload.bonding_curve_id,
            timestamp: event.timestampMs ? new Date(Number(event.timestampMs)) : new Date(), // use timestampMs
            price: payload.price,
            amountIn: payload.amount_in,
            amountOut: payload.amount_out,
            direction: payload.direction,
        }

        console.log("Parsed event:", rawPriceData)

        console.log("[inserted] Raw Price Event:", rawPriceData)

        await db
            .insertInto('raw_prices')
            .values(rawPriceData)
            .execute()
    }
}
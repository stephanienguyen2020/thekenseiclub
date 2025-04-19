// File: src/indexer/trade-handler.ts
import {db} from '../db/database'
import {BondingCurve, RawPrice} from '../db/types'
import {SuiEvent} from '@mysten/sui/client'

export const handleBondingCurveEvent = async (events: SuiEvent[], type: string) => {
    for (const event of events) {
        if (!event.type.startsWith(type)) throw new Error('Invalid event module origin');
        if (event.type.endsWith('::BondingCurveCreatedEvent')) {
            const payload = event.parsedJson as {
                bonding_curve_id: string;
                issuer: string;
                treasury_cap: string;
                coin_metadata: string;
                migration_target: string;
            };
            const bondingCurveData: BondingCurve = {
                bondingCurveId: payload.bonding_curve_id,
                issuer: payload.issuer,
                treasuryCap: payload.treasury_cap,
                coinMetadata: payload.coin_metadata,
                migrationTarget: payload.migration_target,
            }
            console.log(bondingCurveData)
            await db
                .insertInto('bonding_curve')
                .values(bondingCurveData)
                .execute()
            continue
        }
        const payload = event.parsedJson as {
            price: string;
            amount_in: string;
            amount_out: string;
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

        console.log("[inserted] Raw Price Event:", rawPriceData)

        await db
            .insertInto('raw_prices')
            .values(rawPriceData)
            .execute()
    }
}
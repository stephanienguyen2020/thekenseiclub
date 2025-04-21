// File: src/indexer/trade-handler.ts
import {db} from '../db/database'
import {BondingCurve, RawPrices, Timestamp} from '../db/kysely-types/postgres'
import {SuiEvent} from '@mysten/sui/client'

// Define interfaces for the parsed JSON data
interface BondingCurveCreatedEventPayload {
    bonding_curve_id: string;
    issuer: string;
    treasury_cap: string;
    coin_metadata: string;
    migration_target: string;
}

interface TradeEventPayload {
    price: string;
    amount_in: string;
    amount_out: string;
    bonding_curve_id: string;
    direction: string;
}

// Type guard for BondingCurveCreatedEventPayload
function isBondingCurveCreatedEventPayload(payload: unknown): payload is BondingCurveCreatedEventPayload {
    const p = payload as BondingCurveCreatedEventPayload;
    return (
        typeof p === 'object' && 
        p !== null &&
        typeof p.bonding_curve_id === 'string' &&
        typeof p.issuer === 'string' &&
        typeof p.treasury_cap === 'string' &&
        typeof p.coin_metadata === 'string' &&
        typeof p.migration_target === 'string'
    );
}

// Type guard for TradeEventPayload
function isTradeEventPayload(payload: unknown): payload is TradeEventPayload {
    const p = payload as TradeEventPayload;
    return (
        typeof p === 'object' && 
        p !== null &&
        typeof p.price === 'string' &&
        typeof p.amount_in === 'string' &&
        typeof p.amount_out === 'string' &&
        typeof p.bonding_curve_id === 'string'
    );
}

export const handleBondingCurveEvent = async (events: SuiEvent[], type: string): Promise<void> => {
    for (const event of events) {
        if (!event.type.startsWith(type)) throw new Error('Invalid event module origin');

        if (event.type.endsWith('::BondingCurveCreatedEvent')) {
            if (!isBondingCurveCreatedEventPayload(event.parsedJson)) {
                console.error('Invalid BondingCurveCreatedEvent payload:', event.parsedJson);
                continue;
            }

            const payload = event.parsedJson;
            const bondingCurveData: BondingCurve = {
                bondingCurveId: payload.bonding_curve_id,
                issuer: payload.issuer,
                treasuryCap: payload.treasury_cap,
                coinMetadata: payload.coin_metadata,
                migrationTarget: payload.migration_target,
            };

            await db
                .insertInto('bonding_curve')
                .values(bondingCurveData)
                .execute();
            continue;
        }

        if (!isTradeEventPayload(event.parsedJson)) {
            console.error('Invalid trade event payload:', event.parsedJson);
            continue;
        }

        const payload = event.parsedJson;

        if (event.type.endsWith('::BuyEvent')) {
            payload.direction = 'BUY';
        }

        if (event.type.endsWith('::SellEvent')) {
            payload.direction = 'SELL';
        }

        // Safely parse timestampMs
        let timestamp: Date;
        if (event.timestampMs !== undefined && event.timestampMs !== null) {
            const timestampNumber = Number(event.timestampMs);
            timestamp = !isNaN(timestampNumber) ? new Date(timestampNumber) : new Date();
        } else {
            timestamp = new Date();
        }

        const rawPriceData: RawPrices = {
            bondingCurveId: payload.bonding_curve_id,
            timestamp: timestamp as unknown as Timestamp,
            price: payload.price,
            amountIn: payload.amount_in,
            amountOut: payload.amount_out,
            direction: payload.direction,
        };

        await db
            .insertInto('raw_prices')
            .values(rawPriceData)
            .execute();
    }
};

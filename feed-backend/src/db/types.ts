import {Generated} from 'kysely'

export interface CursorTable {
    id: string
    eventSeq: string
    txDigest: string
}

export interface BuyEventTable {
    id: Generated<string>
    timestamp: Date
    buyer: string
    coinType: string
    amountIn: bigint
    tokenOut: bigint
    txDigest: string
}

export interface SellEventTable {
    id: Generated<string>
    timestamp: Date
    seller: string
    coinType: string
    tokenIn: bigint
    amountOut: bigint
    txDigest: string
}

export interface RawPrice {
    id: string
    bondingCurveId: string
    timestamp: Date
    price: string
    amountIn: string
    amountOut: string
    direction: string
}

export interface BondingCurve {
    bondingCurveId: string,
    issuer: string,
    treasuryCap: string,
    coinMetadata: string,
    migrationTarget: string,
}

export interface Database {
    cursors: CursorTable
    buy_events: BuyEventTable
    sell_events: SellEventTable
    raw_prices: RawPrice
    bonding_curve: BondingCurve
}
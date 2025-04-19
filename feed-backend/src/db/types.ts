import {Generated} from 'kysely'

export interface PriceSnapshot {
    id: Generated<number>
    bondingCurveId: string
    timestamp: Date
    open: number
    high: number
    low: number
    close: number
    volume: number
}

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
    price: number
    amountIn: number
    amountOut: number
    direction: string
}

export interface Database {
    cursors: CursorTable
    buy_events: BuyEventTable
    sell_events: SellEventTable
    price_snapshots: PriceSnapshot
    raw_prices: RawPrice
}
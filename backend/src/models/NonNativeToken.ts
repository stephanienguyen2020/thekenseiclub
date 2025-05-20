import mongoose, { Schema, Document } from 'mongoose';

// Interface for platform data
interface IPlatform {
    [key: string]: string;
}

// Interface for token data
export interface IToken extends Document {
    coingeckoId: string;  // Original id from coingecko
    symbol: string;
    name: string;
    image: string;
    platforms: IPlatform;
    current_price_usd: number;
    market_cap_usd: number;
    market_cap_change_percentage_24h_usd: number;
    updatedAt: Date;
}

// Interface for OHLC data
export interface IOHLC extends Document {
    coingeckoId: string;
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    vs_currency: string;
    timeframe: string;  // To store the candle interval (30m, 4h, 4d)
}

// Schema for token
const TokenSchema = new Schema({
    coingeckoId: { type: String, required: true },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String },
    platforms: { type: Map, of: String },
    current_price_usd: { type: Number },
    market_cap_usd: { type: Number },
    market_cap_change_percentage_24h_usd: { type: Number },
    updatedAt: { type: Date, default: Date.now }
});

// Schema for OHLC data
const OHLCSchema = new Schema({
    coingeckoId: { type: String, required: true },
    timestamp: { type: Date, required: true },
    open: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
    close: { type: Number, required: true },
    vs_currency: { type: String, required: true },
    timeframe: { type: String, required: true }
});

// Create indexes
TokenSchema.index({ coingeckoId: 1 }, { unique: true });
TokenSchema.index({ 'platforms': 1 });
TokenSchema.index({ symbol: 1 });
TokenSchema.index({ current_price_usd: 1 });
TokenSchema.index({ market_cap_usd: 1 });

OHLCSchema.index({ coingeckoId: 1, timestamp: 1, vs_currency: 1 }, { unique: true });

// Create models
export const Token = mongoose.model<IToken>('Token', TokenSchema);
export const OHLC = mongoose.model<IOHLC>('OHLC', OHLCSchema);

export interface CoinOptions {
    name: string;
    symbol: string;
    description?: string;
    iconUrl?: string;
    initialSupply: number;
}

export interface TransactionResponse {
    transactionId: string;
    status: string;
    blockNumber?: number;
    timestamp?: number;
}
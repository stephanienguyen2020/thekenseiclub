export const getInferenceTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.
Example response:
\`\`\`json
{
    "topicId": 1,
    "topicName": "Topic Name",
}
\`\`\`

Recent messages:
{{recentMessages}}

Allora Network Topics:
{{alloraTopics}}

Available Topics:
- Topic ID: 1, Topic Name: ETH 10min Prediction
- Topic ID: 2, Topic Name: ETH 24h Prediction
- Topic ID: 4, Topic Name: BTC 24h Prediction
- Topic ID: 5, Topic Name: SOL 10min Prediction
- Topic ID: 6, Topic Name: SOL 24h Prediction
- Topic ID: 7, Topic Name: ETH 20min Prediction
- Topic ID: 8, Topic Name: BNB 20min Prediction
- Topic ID: 9, Topic Name: ARB 20min Prediction
- Topic ID: 10, Topic Name: Memecoin 1h Prediction
- Topic ID: 11, Topic Name: US Presidential Election 2024 - Winning Party
- Topic ID: 17, Topic Name: ETH 8h Prediction
- Topic ID: 18, Topic Name: BTC 8h Prediction
- Topic ID: 19, Topic Name: ETH 8h Volatility Prediction
- Topic ID: 20, Topic Name: BTC 8h Volatility Prediction
- Topic ID: 22, Topic Name: Virtual 5min Price Prediction
- Topic ID: 23, Topic Name: Aixbt 5min Price Prediction
- Topic ID: 24, Topic Name: Luna 5min Price Prediction
- Topic ID: 25, Topic Name: VaderAI 5min Price Prediction
- Topic ID: 26, Topic Name: G.A.M.E 5min Price Prediction
- Topic ID: 27, Topic Name: Sekoia 5min Price Prediction
- Topic ID: 28, Topic Name: ETH/USD - 12h Volatility Prediction
- Topic ID: 29, Topic Name: Arbitrum ETH/USDC Uniswap Pool - 12h Volume Prediction
- Topic ID: 30, Topic Name: ETH/USD - 5min Price Prediction
- Topic ID: 31, Topic Name: Virtual/USDT - 8h Price Prediction
- Topic ID: 32, Topic Name: Aixbt/USDT - 8h Price Prediction
- Topic ID: 33, Topic Name: Luna/USDT - 8h Price Prediction
- Topic ID: 34, Topic Name: VaderAI/USDT - 8h Price Prediction
- Topic ID: 35, Topic Name: Game/USDT - 8h Price Prediction
- Topic ID: 36, Topic Name: Sekoia/USDT - 8h Price Prediction
- Topic ID: 37, Topic Name: SOL/USD - 5min Price Prediction
- Topic ID: 38, Topic Name: SOL/USD - 8h Price Prediction
- Topic ID: 39, Topic Name: SOL/USD - 5min Volatility Prediction
- Topic ID: 40, Topic Name: SOL/USD - 8h Volatility Prediction
- Topic ID: 48, Topic Name: SUI/USDT - 30min Price Prediction

Given the recent messages and the Allora Network Topics above, extract the following information about the requested:
- Topic ID of the topic that best matches the user's request. The topic should be active, otherwise return null.
- Topic Name of the topic that best matches the user's request. The topic should be active, otherwise return null.

If the topic is not active or the inference timeframe is not matching the user's request, return null for both topicId and topicName.

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined. The result should be a valid JSON object with the following schema:
\`\`\`json
{
    "topicId": number | null,
    "topicName": string | null,
}
\`\`\``;

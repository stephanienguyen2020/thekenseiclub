# Coin API Documentation

The Coin API allows for the deployment of new coins on the Sui blockchain using the CoinSDK. This API provides endpoints to create custom tokens with specific properties, retrieve coin listings, and get detailed information about individual coins.

## Endpoints

### Deploy a New Coin

```
POST /coin
```

#### Request Body

The request body should be a JSON object with the following properties:

```json
{
  "name": "My Coin",
  "symbol": "MC",
  "description": "A custom coin for demonstration purposes",
  "iconUrl": "https://example.com/icon.png",
  "address": "0x1234..."
}
```

#### Request Fields

| Field       | Type   | Required | Description                                    |
| ----------- | ------ | -------- | ---------------------------------------------- |
| name        | string | Yes      | The name of the coin                           |
| symbol      | string | Yes      | The symbol/ticker of the coin (e.g., BTC, ETH) |
| description | string | Yes      | A description of the coin's purpose            |
| iconUrl     | string | Yes      | URL to the coin's icon image                   |
| address     | string | Yes      | The address where the coin will be deployed    |

#### Success Response

Upon successful deployment, the API returns a 200 OK status code with a JSON response:

```json
{
  "message": "Coin deployed successfully",
  "network": "testnet",
  "coin": {
    "id": "0x1234...",
    "name": "My Coin",
    "symbol": "MC",
    "description": "A custom coin for demonstration purposes",
    "logo": "https://example.com/icon.png",
    "address": "0x1234...",
    "createdAt": "2025-05-01T12:34:56.789Z"
  }
}
```

#### Error Responses

If the request is invalid or the deployment fails, the API will return an appropriate error status code with a JSON response:

##### 400 Bad Request

```json
{
  "error": "Missing required fields. Please provide name, symbol, description, iconUrl, and address."
}
```

##### 500 Internal Server Error

```json
{
  "error": "Failed to deploy coin",
  "details": "Error message details"
}
```

### Get All Coins (with Pagination)

This endpoint retrieves a paginated list of all coins with market data when available.

```
GET /coins
```

#### Query Parameters

| Parameter | Type    | Required | Description                                     |
| --------- | ------- | -------- | ----------------------------------------------- |
| page      | integer | No       | Page number (default: 1)                        |
| limit     | integer | No       | Number of items per page (default: 10)          |
| userId    | string  | No       | Filter coins created by a specific user address |

#### Success Response

```json
{
  "data": [
    {
      "id": "0x1234...",
      "name": "My Coin",
      "symbol": "MC",
      "description": "A custom coin for demonstration purposes",
      "logo": "https://example.com/icon.png",
      "address": "0x1234...",
      "createdAt": "2025-05-01T12:34:56.789Z",
      "bondingCurveId": "0xabcd...",
      "suiPrice": 0.001,
      "price": 0.02,
      "change24h": 2.5,
      "volume24h": "10000",
      "marketCap": "100000",
      "holders": 50
    }
    // Additional coins...
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### Error Response

```json
{
  "error": "Failed to fetch coins",
  "details": "Error message details"
}
```

### Get Coin by ID

This endpoint retrieves detailed information about a specific coin by its ID.

```
GET /coin/:id
```

#### Path Parameters

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| id        | string | Yes      | The unique identifier of the coin |

#### Success Response

```json
{
  "id": "0x1234...",
  "name": "My Coin",
  "symbol": "MC",
  "description": "A custom coin for demonstration purposes",
  "logo": "https://example.com/icon.png",
  "address": "0x1234...",
  "createdAt": "2025-05-01T12:34:56.789Z",
  "bondingCurveId": "0xabcd...",
  "suiPrice": 0.001,
  "price": 0.02,
  "change24h": 2.5,
  "volume24h": "10000",
  "marketCap": "100000",
  "holders": 50
}
```

#### Error Responses

##### 400 Bad Request

```json
{
  "error": "Coin ID is required"
}
```

##### 404 Not Found

```json
{
  "error": "Coin not found"
}
```

##### 500 Internal Server Error

```json
{
  "error": "Failed to fetch coin",
  "details": "Error message details"
}
```

### Get All Coins (No Pagination)

This endpoint retrieves all coins without pagination and without market data.

```
GET /allCoins
```

#### Success Response

```json
{
  "data": [
    {
      "id": "0x1234...",
      "name": "My Coin",
      "symbol": "MC",
      "description": "A custom coin for demonstration purposes",
      "logo": "https://example.com/icon.png",
      "address": "0x1234...",
      "createdAt": "2025-05-01T12:34:56.789Z"
    }
    // Additional coins...
  ]
}
```

#### Error Response

```json
{
  "error": "Failed to fetch all coins",
  "details": "Error message details"
}
```

### Get Holding Coins for a Wallet Address

This endpoint retrieves all coins held by a specified wallet address on the Sui blockchain with pagination.

```
GET /holding-coins/:walletAddress
```

#### Path Parameters

| Parameter     | Type   | Required | Description                 |
| ------------- | ------ | -------- | --------------------------- |
| walletAddress | string | Yes      | The wallet address to query |

#### Query Parameters

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| page      | integer | No       | Page number (default: 1)               |
| limit     | integer | No       | Number of items per page (default: 10) |

#### Success Response

```json
{
  "data": [
    {
      "id": "0x1234...",
      "coinType": "0x2::sui::SUI",
      "symbol": "SUI",
      "name": "Sui",
      "balance": 10.5,
      "description": "Native token of the Sui blockchain",
      "logo": "https://example.com/sui-logo.png",
      "address": "0x1234...",
      "createdAt": "2025-05-01T12:34:56.789Z",
      "suiPrice": 1,
      "price": 2.5,
      "change24h": 0.5,
      "volume24h": "1000000",
      "marketCap": "50000000",
      "holders": 1000
    },
    {
      "id": "0xabcd...",
      "coinType": "0x765d83f28b477831a2b61bc475770b8288a67902::mycoin::COIN",
      "symbol": "MYCOIN",
      "name": "My Coin",
      "balance": 100,
      "description": "A custom coin for demonstration purposes",
      "logo": "https://example.com/icon.png",
      "address": "0xabcd...",
      "createdAt": "2025-05-01T12:34:56.789Z",
      "suiPrice": 0.001,
      "price": 0.02,
      "change24h": 2.5,
      "volume24h": "10000",
      "marketCap": "100000",
      "holders": 50
    }
    // Additional coins...
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### Error Responses

##### 400 Bad Request

```json
{
  "error": "Wallet address is required"
}
```

##### 500 Internal Server Error

```json
{
  "error": "Failed to fetch holding coins",
  "details": "Error message details"
}
```

## Example Request

```bash
curl -X POST "http://localhost:3000/coin" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Coin",
    "symbol": "MC",
    "description": "A custom coin for demonstration purposes",
    "iconUrl": "https://example.com/icon.png",
    "address": "0x1234..."
  }'
```

## Notes

- The API uses the active network configuration from the environment (defaults to testnet if not specified)
- The CoinSDK handles the actual deployment process on the Sui blockchain
- Make sure the address provided has sufficient gas to deploy the coin
- Market data is only available for coins that have an associated bonding curve

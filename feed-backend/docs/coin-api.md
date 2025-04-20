# Coin API Documentation

The Coin API allows for the deployment of new coins on the Sui blockchain using the CoinSDK. This API is useful for creating custom tokens with specific properties.

## Endpoint

```
POST /coin
```

## Request Body

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

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | The name of the coin |
| symbol | string | Yes | The symbol/ticker of the coin (e.g., BTC, ETH) |
| description | string | Yes | A description of the coin's purpose |
| iconUrl | string | Yes | URL to the coin's icon image |
| address | string | Yes | The address where the coin will be deployed |

## Response

### Success Response

Upon successful deployment, the API returns a 200 OK status code with a JSON response:

```json
{
  "message": "Coin deployed successfully",
  "network": "testnet"
}
```

### Error Responses

If the request is invalid or the deployment fails, the API will return an appropriate error status code with a JSON response:

#### 400 Bad Request

```json
{
  "error": "Missing required fields. Please provide name, symbol, description, iconUrl, and address."
}
```

#### 500 Internal Server Error

```json
{
  "error": "Failed to deploy coin",
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
- The deployment process is asynchronous and may take some time to complete

# Betting API Endpoints

This directory contains API endpoints for interacting with the betting smart contract via an agent account.

## Endpoints

### 1. Create Bet For User

**URL:** `/api/bets/create-for-user`  
**Method:** `POST`  
**Description:** Creates a new bet on behalf of a user identified by Twitter handle.

**Request Body:**

```json
{
  "twitterHandle": "username",
  "title": "Will X happen by the end of 2024?",
  "description": "Detailed description of the bet",
  "category": "Politics",
  "endDate": 1704067200, // Unix timestamp for bet end date
  "amount": 1000000000000000000, // 1 ETH in wei
  "initialPoolAmount": 1000000000000000000, // 1 ETH in wei
  "imageURL": "https://example.com/image.jpg" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "Bet created successfully",
  "transactionHash": "0x123...",
  "betId": "1",
  "redirectUrl": "/bets"
}
```

### 2. Join Bet For User

**URL:** `/api/bets/join-for-user`  
**Method:** `POST`  
**Description:** Joins an existing bet on behalf of a user identified by Twitter handle.

**Request Body:**

```json
{
  "twitterHandle": "username",
  "betId": 1,
  "support": true // true for YES position, false for NO position
}
```

**Response:**

```json
{
  "success": true,
  "message": "Bet joined successfully. Position: Yes",
  "transactionHash": "0x123...",
  "redirectUrl": "/bets/place-bet?id=1"
}
```

### Register Twitter Handle

**URL:** `/api/bets/register-twitter`  
**Method:** `POST`  
**Description:** Registers a Twitter handle to associate it with a wallet address in the smart contract.

**Request Body:**

```json
{
  "twitterHandle": "username",
  "signature": "signature_from_wallet",
  "message": "The message that was signed"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Twitter handle registered successfully",
  "transactionHash": "0x123...",
  "redirectUrl": "/bets"
}
```

## Error Responses

All endpoints return similar error responses:

```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

With appropriate HTTP status codes (400 for validation errors, 500 for server errors).

## Environment Variables

The API endpoints require the following environment variables:

- `AGENT_PRIVATE_KEY`: Private key of the agent wallet
- `NEXT_PUBLIC_RPC_URL`: RPC URL for the blockchain connection

## Error Handling

All endpoints include consistent error handling for:

- Missing parameters
- Agent authorization issues
- Twitter handle registration issues
- Smart contract errors

For detailed setup instructions and troubleshooting, see `setup-guide.md`.

## API Usage Flow

Follow these steps to use the betting API endpoints properly:

1. **Register Twitter Handles First**

   - A Twitter handle must be registered in the contract before it can create or join bets
   - Use the `/api/bets/register-twitter` endpoint to register handles

2. **Purchase Bet Credits**

   - The agent wallet must have bet credits to create bets on behalf of users
   - Use the `/api/bets/add-credits` endpoint to purchase credits by sending ETH
   - Credits are stored in the agent's wallet address

3. **Create Bets for Users**

   - After registration and purchasing credits, you can create bets for users
   - The agent uses its bet credits to create the bet

4. **Join Existing Bets**
   - Users can join existing bets using the `/api/bets/join-for-user` endpoint
   - No bet credits are required to join a bet, only the bet amount

## Troubleshooting

### "Twitter handle not registered"

- Make sure the Twitter handle is registered using the registration endpoint
- The handle is case-sensitive, so ensure it matches exactly

### "Insufficient bet credits"

- The agent wallet needs more bet credits
- Purchase credits using the `/api/bets/add-credits` endpoint
- Make sure the amount of credits is sufficient for the bet values

### "Only agent can call this function"

- The wallet signing transactions is not registered as an agent in the contract
- Contact the contract owner to register your wallet as an agent

## See Also

For more detailed information, refer to:

- `setup-guide.md`: Detailed setup and troubleshooting
- Test clients: Example code for testing each endpoint
  - `register-client.js`: Test Twitter handle registration
  - `add-credits-client.js`: Test purchasing bet credits
  - `test-client.js`: Test creating and joining bets

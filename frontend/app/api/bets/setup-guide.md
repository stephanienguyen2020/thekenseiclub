# Agent API Setup Guide

## Common Error: "Only agent can call this function"

This error occurs when the wallet address used for the Agent API is not registered as an agent in the smart contract.

### Solution:

1. Make sure you have set the `AGENT_PRIVATE_KEY` environment variable in your .env.local file:

   ```
   AGENT_PRIVATE_KEY=your_private_key_here
   ```

2. Register the wallet address as an agent in the smart contract:

   - The wallet address derived from the private key must be registered as an agent
   - Contact the contract owner to register your wallet address as an agent

3. To check if your wallet is properly set up as an agent:

   - Use the BettingService to call the `isAgent` method with your wallet address
   - Or use Etherscan to call the contract's `isAgent` function with your address

4. After confirming registration, restart your Next.js application to apply the environment variable changes.

## Common Error: "Twitter handle not registered"

This error occurs when trying to create or join a bet for a Twitter handle that has not been registered in the smart contract.

### Solution:

1. Each Twitter handle must be registered in the smart contract before it can be used with the Agent API
2. Users need to register their Twitter handles with their wallet addresses through the dApp interface
3. The registration process typically involves:
   - User connecting their wallet to the dApp
   - User verifying ownership of their Twitter handle (through signing a message or other verification methods)
   - Registering the Twitter handle in the smart contract

### Registration Process for Testing:

If you're testing the API, you can register test Twitter handles using the following options:

#### Option 1: Use the Registration API Endpoint (Recommended)

We've created a dedicated API endpoint for Twitter handle registration:

1. Use the `/api/bets/register-twitter` endpoint with the following parameters:

   - `twitterHandle`: The Twitter handle to register
   - `signature`: A signature from the user's wallet (proving ownership)
   - `message`: The message that was signed

2. Test this endpoint using the provided test client:

   ```
   node app/api/bets/register-client.js
   ```

3. In a production environment, you would implement proper signature verification to ensure the user owns both the wallet and the Twitter handle.

#### Option 2: Use the BettingService Directly

1. Use the BettingService to call the `registerTwitterHandle` method directly
2. This requires:
   - A wallet with enough funds for gas
   - The Twitter handle to register

## Testing Your Setup

1. After setting up the agent authorization and registering Twitter handles, test the full API using the test client:

   ```
   node app/api/bets/test-client.js
   ```

2. If everything is set up correctly, you should be able to create and join bets without authorization errors.

3. For production use, make sure to:
   - Use a secure method to store your private key
   - Implement rate limiting and additional security measures
   - Monitor API usage for unusual patterns

## Common Error: "Insufficient bet credits"

This error occurs when a user attempts to create a bet without having sufficient bet credits in the smart contract.

### Solution:

1. Bet credits must be purchased by sending ETH to the smart contract
2. Users need to call the `buyBetCredits` function with some ETH to receive credits

### Purchasing Bet Credits:

If you're testing the API, you can purchase bet credits in one of these ways:

1. Using the API endpoint:

   ```
   POST /api/bets/add-credits
   {
     "twitterHandle": "example_user",
     "credits": 0.01  // Amount of ETH to send
   }
   ```

2. Using the provided test client:

   ```
   node app/api/bets/add-credits-client.js
   ```

3. Directly in the frontend by connecting a wallet and calling the contract's `buyBetCredits` function with some ETH

After purchasing bet credits, retry creating a bet for the user.

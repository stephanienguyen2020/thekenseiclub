# Coin SDK

A TypeScript SDK for interacting with coin contracts on the Sui blockchain. This SDK provides a simple interface for deploying new coins, managing coin metadata, and interacting with bonding curves.

## Installation

```bash
npm install coin-sdk
```

## Features

- Deploy new coins on the Sui blockchain
- Update coin information (name, symbol, description, icon URL)
- Create and transfer coins
- Interact with bonding curves (buy, sell, migrate)

## Usage

### Importing the SDK

```typescript
import { CoinSDK, BondingCurveSDK, SuiUtils } from 'coin-sdk';
```

### Creating a new coin

```typescript
import { CoinSDK, SuiUtils } from 'coin-sdk';

// Get a Sui client
const client = SuiUtils.getClient('testnet');

// Deploy a new coin
await CoinSDK.deployNewCoin({
  name: "MyCoin",
  symbol: "MC",
  description: "My custom coin on Sui",
  iconUrl: "https://example.com/icon.png",
  client,
  address: "your-sui-address"
});
```

### Interacting with an existing coin

```typescript
import { CoinSDK, SuiUtils } from 'coin-sdk';

// Get a Sui client
const client = SuiUtils.getClient('testnet');

// Create a CoinSDK instance
const coinSdk = new CoinSDK(
  "treasury-cap-object-id",
  client,
  "package-id",
  "coin-metadata-object-id"
);

// Mint and transfer coins
await coinSdk.createCoinAndTransfer({
  amount: 1000000000,
  recipient: "recipient-address",
  address: "your-sui-address"
});

// Update coin information
await coinSdk.updateCoinInfo({
  name: "MyCoin",
  symbol: "MC",
  description: "Updated description",
  iconUrl: "https://example.com/new-icon.png",
  address: "your-sui-address"
});
```

### Working with bonding curves

```typescript
import { BondingCurveSDK, SuiUtils } from 'coin-sdk';

// Get a Sui client
const client = SuiUtils.getClient('testnet');

// Create a BondingCurveSDK instance
const bondingCurveSdk = new BondingCurveSDK(
  "bonding-curve-object-id",
  client,
  "bonding-curve-package-id"
);

// Buy tokens
await bondingCurveSdk.buy({
  amount: 10000000,
  minTokenRequired: 0,
  type: "coin-type",
  address: "your-sui-address"
});

// Sell tokens
await bondingCurveSdk.sell({
  amount: 10000000,
  minSuiRequired: 0,
  type: "coin-type",
  address: "your-sui-address"
});
```

## API Reference

### CoinSDK

#### Static Methods

- `deployNewCoin(options)`: Deploy a new coin on the Sui blockchain

#### Instance Methods

- `updateCoinInfo(options)`: Update coin information
- `createCoinAndTransfer(options)`: Mint and transfer coins

### BondingCurveSDK

#### Static Methods

- `createBondingCurve(treasuryCap, coinMetadata, initialSupply, client, packageId, coinType, address)`: Create a new bonding curve

#### Instance Methods

- `buy(options)`: Buy tokens from the bonding curve
- `sell(options)`: Sell tokens to the bonding curve
- `migrateToFlowx(address)`: Migrate to Flowx

### SuiUtils

- `getClient(network)`: Get a Sui client for the specified network
- `signAndExecute(txb, network, address)`: Sign and execute a transaction
- `publishPackage(options)`: Publish a package to the Sui blockchain
- And more utility functions for working with the Sui blockchain

## License

MIT
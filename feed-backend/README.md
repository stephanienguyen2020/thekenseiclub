# Feed Backend

A backend service for blockchain data feeds, providing APIs for OHLCV (Open, High, Low, Close, Volume) data and coin deployment on the Sui blockchain.

## Features

- OHLCV API for retrieving price data with customizable time intervals
- Coin API for deploying new coins on the Sui blockchain
- Event indexer for tracking blockchain events
- PostgreSQL database integration using Kysely ORM

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Sui blockchain node access

## Installation

- Clone the repository
- Install dependencies:
   ```bash
   npm install
   ```
- Install postgres client:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
  
   # Check if postgres is running
   sudo systemctl status postgresql
   ```
- Create timeseries database:
   ```bash
   docker run -d --name timescaledb -p 5432:5432 -e POSTGRES_PASSWORD=password timescale/timescaledb-ha:pg17
   ```
- Set up db migrations:
   ```bash
   npx kysely-ctl migrate up
   ```
- Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sui
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Network Configuration
NETWORK=testnet  # Options: mainnet, testnet, devnet, localnet
```

## API Documentation

The service provides two main APIs:

- [OHLCV API](./docs/ohlcv-api.md) - For retrieving price data
- [Coin API](./docs/coin-api.md) - For deploying new coins

## Development

```bash
# Run in development mode with hot reloading
npm run dev

# Build for production
npm run build

# Start production server
npm start

# gen Kysely model
chmod +x kysely-codegen.sh # If Permission denied
./kysely-codegen.sh
```

## Project Structure

```
feed-backend/
├── src/
│   ├── db/              # Database configuration and types
│   ├── indexer/         # Blockchain event indexing
│   ├── routes/          # API routes
│   ├── config.ts        # Application configuration
│   ├── index.ts         # Main entry point
│   └── utils.ts         # Utility functions
├── package.json
└── tsconfig.json
```

## License

ISC
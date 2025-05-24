# Backend

A backend service for blockchain data feeds, providing APIs for OHLCV (Open, High, Low, Close, Volume) data, coin deployment, and social media functionality on the Sui blockchain.

## Features

- OHLCV API for retrieving price data with customizable time intervals
- Coin API for deploying new coins on the Sui blockchain and retrieving coin information
- Social Feed API for posts, comments, and likes for a blockchain-based social network
- Image upload and retrieval for posts and user profiles
- User management and authentication
- DAO functionality for community governance
- Event indexer for tracking blockchain events
- PostgreSQL database integration using Kysely ORM
- MongoDB integration for additional data storage

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- MongoDB database
- Sui blockchain node access
- pnpm or bun package manager (recommended)
- Sui installed: https://docs.sui.io/guides/developer/getting-started/sui-install

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/suihackathon.git
   cd suihackathon/backend
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   # or
   bun install
   ```

3. **Database Setup**

   Start PostgreSQL TimescaleDB (for time-series data):

   ```bash
   docker run -d --name timescaledb -p 5432:5432 -e POSTGRES_PASSWORD=password timescale/timescaledb-ha:pg17
   ```

   Start MongoDB (for document storage):

   ```bash
   docker run -d \
   --name mongodb \
   -p 27017:27017 \
   -e MONGO_INITDB_ROOT_USERNAME=root \
   -e MONGO_INITDB_ROOT_PASSWORD=example \
   -v mongodb_data:/data/db \
   mongo:6.0
   ```

4. **Environment Configuration**

   Create a `.env` file in the backend directory:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your specific configuration values.

5. **Run Database Migrations**

   ```bash
   npx kysely-ctl migrate up
   ```

6. **Generate Database Types**

   ```bash
   chmod +x kysely-codegen.sh  # Make the script executable if needed
   ./kysely-codegen.sh
   ```

7. **Start the Development Server**

   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   bun dev
   ```

   Or with specific environment variables:

   ```bash
   PORT=3001 NETWORK=devnet PACKAGE_ID=0x8193d051bd13fb4336ad595bbb78dac06fa64ff1c3c3c184483ced397c9d2116 pnpm run dev
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

The service provides the following APIs:

- [OHLCV API](./docs/ohlcv-api.md) - For retrieving price data
- [Coin API](./docs/coin-api.md) - For deploying new coins
- [Social Feed API](./docs/social-feed-api.md) - For social media functionality including users, posts, comments, likes, and images

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

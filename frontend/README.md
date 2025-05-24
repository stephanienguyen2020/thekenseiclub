# Frontend

This is the frontend application for thekenseiclub.

## Installation Guide

1. **Clone the repository**

   ```bash
   git clone https://github.com/stephanienguyen2020/thekenseiclub.git
   cd suihackathon/thekenseiclub
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   # or
   bun install
   ```

3. **Environment Variables**

   Create a `.env` file in the frontend directory:

   ```bash
   cp .env.example .env
   ```

   Then edit the `.env` file with your own values:

   - `BE_HOST` and `BE_PORT`: Backend service host and port
   - `NEXT_PUBLIC_PACKAGE_ID`: Your Sui package ID
   - `NEXT_PUBLIC_NETWORK`: Choose between testnet, mainnet, or devnet
   - `OPENAI_KEY`: Your OpenAI API key (server-side only, secure)
   - `NEWS_API_KEY`: Your News API key (server-side only, secure)
   - `MONGODB_URI`: Your MongoDB connection string (server-side only, secure)

4. **Run the development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   bun dev
   ```

5. **Build for production**

   ```bash
   pnpm build
   # or
   npm run build
   # or
   bun run build
   ```

## Features

- Interactive dashboard
- Sui wallet integration
- Real-time data visualization
- News integration

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Sui SDK

HyperSonic is an **AI-driven platform** for meme coin trading, research, and creation. Whether you're betting on trends, launching tokens, or analyzing market data, HyperSonic provides the tools to stay ahead.

## 🚀 Features

### **Seamless Wallet Integration**

Connect wallets easily with secure authentication—no private key management required.

### **Dashboard & Portfolio Tracking**

Monitor holdings in real-time, track profits/losses, and get AI-driven price predictions.

### **🛠 Betting Marketplace**

Bet on meme coin trends directly via Twitter by tagging **@HyperSonic**. Smart contracts ensure secure escrow and instant payouts.

### **🚀 Meme Coin Launch Pad**

Launch your own token with an AI-powered branding assistant, instant deployment, and on-chain security.

- Utilizes a custom bonding curve that dynamically adjusts token prices based on market supply and demand.
- Once a meme token reaches its funding goal, liquidity creation is triggered through the Native Liquidity Pool. Early contributors receive rewards, allowing them to mint additional tokens on Electroneum.
- A Marketplace where users can create, buy, and trade all launched meme tokens.

### **📊 AI Research & Trading Tools**

- **Market Insights:** Track trends, social engagement, and whale movements.
- **Swap Agent:** Find the best liquidity pools and trade efficiently.
- **News Agent:** Get real-time alerts on market-moving events.
- **Sentiment Analysis & Predictions:** AI forecasts price trends based on historical data.

---

# **How to Run HyperSonic**

## **1. Clone the Repository**

```bash
git clone https://github.com/stephanienguyen2020/memetron
cd memetron
```

## **2. Set Up Environment Variables**

Create a `.env` file inside both the `frontend/` and `backend/` directories.

```bash
# Copy the sample environment files
cp frontend/.env.sample frontend/.env
cp backend/.env.sample backend/.env

# Edit the .env files and fill in your credentials
```

## **3. Running the Frontend**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
# or
bun install

# Start the development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

This will start the frontend on [http://localhost:3000](http://localhost:3000).

## **4. Running the Backend**

In a separate terminal:

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload
```

This will start the backend on [http://localhost:8000](http://localhost:8000).

## **5. Running the Eliza Agent**

In a new terminal window:

```bash
# Clone the repository (if not already done)
git clone https://github.com/stephanienguyen2020/memetron
cd memetron

# Switch to the Eliza branch
git checkout eliza

# Create and configure environment
cp .env.sample .env
# Edit .env file with your credentials

# Install dependencies and build
pnpm install
pnpm build

# Start the Eliza agent
pnpm start --character="characters/crypto-sage.json"
```

## Troubleshooting

If you encounter any issues:

1. Make sure all environment variables are properly set
2. Check that all required ports (3000, 8000) are available
3. Ensure you have the correct versions of Node.js and Python installed
4. Clear your browser cache if you experience UI issues

## Development Notes

- The frontend runs on Next.js 14 with App Router
- Backend uses FastAPI with Python 3.8+
- Eliza agent requires Node.js 18+ and pnpm
- Make sure to run all three components (frontend, backend, and Eliza agent) for full functionality

## 💻 Technology Stack

### 🎨 Frontend & UI

![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### 🔧 Backend & API

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![ElizaOS](https://img.shields.io/badge/ElizaOS-FF6B6B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PC9zdmc+&logoColor=white)

### ⛓️ Blockchain & Smart Contracts

![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-FFD700?style=for-the-badge&logo=hardhat&logoColor=black)
![NebulaBlock](https://img.shields.io/badge/NebulaBlock-6F4BB2?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PC9zdmc+&logoColor=white)

### 📦 Storage & IPFS

![Pinata](https://img.shields.io/badge/Pinata-E4405F?style=for-the-badge&logo=pinata&logoColor=white)

### 📊 AI & Integration

![OpenAI](https://img.shields.io/badge/GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white)
![Twitter API](https://img.shields.io/badge/Twitter%20API-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

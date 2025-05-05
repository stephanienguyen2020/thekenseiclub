# 🥋 Kensei – The SocialFi Layer for Meme Coins on SUI

![Image 1](https://drive.google.com/uc?export=view&id=1voGMmuPIvsoEmpuRqUGI29c9Yal8-N8a)

Memes are culture. Let’s make them governable.

Kensei is a SocialFi platform built on the SUI blockchain, designed to transform meme coins from fleeting hype into sustainable, community-driven assets. We provide a social and governance layer that empowers holders, creators, and communities to collaborate, vote, and shape the future of their tokens.

## 🚀 Why Kensei?

Meme coins often lack structure, transparency, and post-launch governance. They're typically launched, pumped, and then abandoned, leaving investors without a say in the project's direction. Kensei addresses this by:

- Providing each meme coin with its own social profile, token feed, and governance layer
- Enabling holders to create proposals and vote on token-related decisions
- Facilitating discussions and updates through on-chain forums and polls
- Allowing easy buying, selling, or swapping of tokens via a natural language chatbot

![Image 2](https://drive.google.com/uc?export=view&id=1IdTcE4A2YujTB0cP1roeGp7fsDbUq6Ax)

## 🚀 Contract Address

Contracts on testnet:

- **Bonding curve**: 0x913fe46c07dc2fac627f94a9727a26e8e671f0e816b83d1bd5096e2889f1d2d5

## 🧱 Core Features

### 1. 🪧 Token feed

- Real-time social feed for each meme coin showcasing latest updates and community activity
- Token-specific posts, comments, and reactions to foster engagement and transparency
<img width="1885" alt="Screenshot 2025-05-05 at 21 29 31" src="https://github.com/user-attachments/assets/2f247f84-d261-44a7-aae9-7fbbef3e750f" />


### 2. 📊 On-Chain Governance

- Token holders can propose and vote on key decisions (e.g., treasury allocation, token burns, liquidity additions)
- Each token has its own forum, polls, and updates, fostering community-driven development

![Image 4](https://drive.google.com/uc?export=view&id=1mQJXu717lxIISAXLnHLIDY8ny0A8Aoqk)

### 3. 💧 Virtual Liquidity via Bonding Curves

- Enables immediate trading of newly created tokens without the need for initial liquidity pools
- Prices adjust automatically as tokens are minted or burned
- Once a token reaches a predefined trading volume, it transitions to a full AMM pool on FlowX DEX using the FlowX TypeScript SDK

![Image 3](https://drive.google.com/uc?export=view&id=17e6U1PzqIIRxOrRajP-FglURlwr4E3vv)

### 4. 🧠 AI Agentic Launchpad

- Create meme coins in seconds using natural language prompts or manual input
- Automatically generate tokens with unique social profiles
- Engage with the community through posts, tags, and social interactions
<img width="1886" alt="Screenshot 2025-05-05 at 21 24 40" src="https://github.com/user-attachments/assets/6b174867-6ab9-4805-8250-2cd6b4524f97" />


### 5. 🤖 Multi-Agent AI Framework

- **News Agent**: Monitors real-time crypto news
- **Asset Agent**: Facilitates buying, selling, and swapping of tokens
- **AutoShill Agent**: Enhances visibility across social media platforms
- **Whale Watch Agent**: Tracks large-scale transactions
- **Sentiment Agent**: Analyzes cross-platform sentiment
<img width="1890" alt="Screenshot 2025-05-05 at 21 26 19" src="https://github.com/user-attachments/assets/6bfe7516-58ac-4fa6-9b80-2ec8325fb36d" />


## 💻 Technology Stack

### 🎨 Frontend & UI

![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### ⛓️ Blockchain & Smart Contracts

![Move](https://img.shields.io/badge/Move-363636?style=for-the-badge&logo=move&logoColor=white)
![FlowX](https://img.shields.io/badge/FlowX-FFD700?style=for-the-badge&logo=flowX&logoColor=black)

### 📦 Storage

![Walrus](https://img.shields.io/badge/Walrus-E4405F?style=for-the-badge&logo=walrus&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-E4405F?style=for-the-badge&logo=mongodb&logoColor=white)

### 📊 AI & Integration

![OpenAI](https://img.shields.io/badge/GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white)
![ElizaOS](https://img.shields.io/badge/ElizaOS-4B0082?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PC9zdmc+&logoColor=white)
![Twitter API](https://img.shields.io/badge/Twitter%20API-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Crypto wallet (Slush Wallet)
- pnpm package manager

### Installation

For detailed installation instructions, please refer to:

- [Frontend Installation Guide](/frontend/README.md)
- [Backend Installation Guide](/backend/README.md)

For the Move contracts:

```bash
cd move/coin-sdk
sui move build
```

## 🌐 Access Points

- Frontend: [http://localhost:3000](http://localhost:3000)

## 👥 Built By

Kensei is developed by a dedicated university team passionate about crypto, AI, and community-driven innovation. Our mission is to provide meme coins with the tools to evolve from mere speculation to sovereign, governed assets.

## 🤝 Support

For support, please reach out to our team or join our community channels.

_Powered by SUI, FlowX, Zerepy, and ElizaOS – Revolutionizing the meme economy, one token at a time._

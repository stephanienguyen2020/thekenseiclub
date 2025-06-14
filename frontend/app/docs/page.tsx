"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/navbar";

export default function Documentation() {
  const [activeSection, setActiveSection] = useState("introduction");

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "introduction",
        "getting-started",
        "dashboard",
        "wallet",
        "proposals",
        "chatbot",
        "tweets",
        "token-launch",
        "fee-sharing",
        "marketplace",
        "governance",
        "api",
      ];

      // Find the section that is currently in view
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Add the navbar directly in this page */}
      <Navbar isAuthenticated={false} />

      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-[#0046F4] text-white py-16 px-16">
          <div className="max-w-8xl">
            <h1 className="text-7xl md:text-6xl font-bold mb-4">
              Kensei Documentation
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl">
              Your comprehensive guide to using the Kensei platform for social
              trading, token launching, and community governance.
            </p>
          </div>
        </div>

        <div className="max-w-8xl mx-auto px-16 py-8 flex flex-col md:flex-row gap-12">
          {/* Sidebar Navigation - Improved sticky behavior */}
          <div className="md:w-1/4 h-full">
            <div className="sticky top-24 border-4 border-black bg-[#c0ff00] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-bold mb-4">Contents</h2>
              <nav>
                <ul className="space-y-2">
                  {[
                    { id: "introduction", label: "Introduction" },
                    { id: "getting-started", label: "Getting Started" },
                    { id: "dashboard", label: "Dashboard" },
                    { id: "wallet", label: "My Wallet" },
                    { id: "proposals", label: "Proposals" },
                    { id: "chatbot", label: "Chat Bot" },
                    { id: "tweets", label: "My Tweets" },
                    { id: "token-launch", label: "Token Launch" },
                    { id: "fee-sharing", label: "Fee Sharing" },
                    { id: "marketplace", label: "Marketplace" },
                    { id: "governance", label: "Governance" },
                    { id: "api", label: "API Reference" },
                  ].map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left px-2 py-1 rounded ${
                          activeSection === item.id
                            ? "bg-black text-white"
                            : "hover:bg-black hover:bg-opacity-10"
                        }`}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4 space-y-12">
            <section
              id="introduction"
              className="border-4 border-black bg-[#FFD166] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-3xl font-bold mb-4">Introduction</h2>
              <p className="mb-4">
                Kensei is a revolutionary platform that combines social media,
                decentralized finance, and community governance. It allows users
                to create, trade, and govern social tokens while building
                communities around shared interests.
              </p>
              <p className="mb-4">
                This documentation provides a comprehensive guide to using the
                platform, from setting up your account to launching your own
                token and participating in governance decisions.
              </p>
              <div className="bg-white border-l-4 border-[#0046F4] p-4 my-6">
                <p className="font-bold">Note</p>
                <p>
                  Kensei is currently in beta. Features and functionality may
                  change as we continue to develop the platform.
                </p>
              </div>
            </section>

            <section
              id="getting-started"
              className="border-4 border-black bg-[#EF476F] text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
              <h3 className="text-2xl font-bold mb-2">Creating an Account</h3>
              <p className="mb-4">
                To get started with Kensei, you'll need to create an account.
                Click the "Connect Wallet" button in the top right corner of the
                homepage and follow the instructions to connect your wallet.
              </p>
              <h3 className="text-2xl font-bold mb-2">
                Navigating the Platform
              </h3>
              <p className="mb-4">
                Once you've created an account, you can navigate the platform
                using the navigation bar at the top of the page. Here's a quick
                overview of the main sections:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong>Feed:</strong> View posts from other users and
                  communities you follow.
                </li>
                <li>
                  <strong>Marketplace:</strong> Discover and trade social
                  tokens.
                </li>
                <li>
                  <strong>Launch:</strong> Create and launch your own social
                  token.
                </li>
                <li>
                  <strong>Dashboard:</strong> Access your wallet, proposals,
                  chatbot, and tweets.
                </li>
              </ul>
            </section>

            <section
              id="dashboard"
              className="border-4 border-black bg-[#06D6A0] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
              <p className="mb-4">
                Your dashboard is your personal command center for Kensei. It
                provides access to your wallet, proposals, chatbot, and tweets.
              </p>
              <div className="mb-6">
                <Image
                  src="/modern-data-dashboard.png"
                  alt="Dashboard Interface"
                  width={600}
                  height={300}
                  className="border-2 border-black"
                />
              </div>
              <p className="mb-4">
                The dashboard features a sidebar navigation that allows you to
                quickly access different sections:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong>My Wallet:</strong> View and manage your token
                  holdings.
                </li>
                <li>
                  <strong>My Proposals:</strong> Track proposals you've created
                  or participated in.
                </li>
                <li>
                  <strong>Chat Bot:</strong> Get assistance and information
                  through our AI chatbot.
                </li>
                <li>
                  <strong>My Tweets:</strong> Manage and view your social posts.
                </li>
              </ul>
            </section>

            <section
              id="wallet"
              className="border-4 border-black bg-[#118AB2] text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-3xl font-bold mb-4">My Wallet</h2>
              <p className="mb-4">
                The My Wallet section displays all your token holdings and
                allows you to manage them efficiently.
              </p>
              <h3 className="text-2xl font-bold mb-2">Holdings</h3>
              <p className="mb-4">
                Your holdings are displayed in a table format, showing the token
                name, amount, value, and actions you can take.
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full border-4 border-black">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="py-2 px-4 text-left">Token</th>
                      <th className="py-2 px-4 text-left">Amount</th>
                      <th className="py-2 px-4 text-left">Value</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-black">
                    <tr className="border-b-2 border-black">
                      <td className="py-2 px-4">$DOGE</td>
                      <td className="py-2 px-4">1,000</td>
                      <td className="py-2 px-4">$100</td>
                      <td className="py-2 px-4">
                        <button className="bg-black text-white px-3 py-1 mr-2">
                          View
                        </button>
                        <button className="bg-[#c0ff00] text-black px-3 py-1">
                          AutoShill
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4">$SHIB</td>
                      <td className="py-2 px-4">5,000</td>
                      <td className="py-2 px-4">$250</td>
                      <td className="py-2 px-4">
                        <button className="bg-black text-white px-3 py-1 mr-2">
                          View
                        </button>
                        <button className="bg-[#c0ff00] text-black px-3 py-1">
                          AutoShill
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h3 className="text-2xl font-bold mb-2">AutoShill Feature</h3>
              <p className="mb-4">
                The AutoShill button allows you to automatically generate
                promotional content for your tokens. When clicked, it will
                create a post that highlights the benefits and potential of your
                token.
              </p>
              <div className="bg-white text-black p-4 border-l-4 border-[#c0ff00] mb-4">
                <p className="font-mono">
                  Just bought more $DOGE! 🚀 This token is going to the moon! 🌕
                  #DOGE #ToTheMoon #Crypto
                </p>
              </div>
              <h3 className="text-2xl font-bold mb-2">Created Tokens</h3>
              <p className="mb-4">
                The Created Tokens tab shows all the tokens you've created on
                the platform. You can manage and monitor their performance from
                here.
              </p>
            </section>

            <section
              id="proposals"
              className="border-4 border-black bg-[#c0ff00] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-3xl font-bold mb-4">Proposals</h2>
              <p className="mb-4">
                The Proposals section allows you to view and manage governance
                proposals you've created or participated in.
              </p>
              <h3 className="text-2xl font-bold mb-2">Creating a Proposal</h3>
              <p className="mb-4">To create a new proposal:</p>
              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>Navigate to a token's page in the Marketplace</li>
                <li>Click on "Create Proposal"</li>
                <li>
                  Fill out the proposal form with a title, description, and
                  options
                </li>
                <li>Submit the proposal for voting</li>
              </ol>
              <h3 className="text-2xl font-bold mb-2">Voting on Proposals</h3>
              <p className="mb-4">To vote on a proposal:</p>
              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>Navigate to the proposal page</li>
                <li>Review the proposal details</li>
                <li>Select your preferred option</li>
                <li>Click "Vote" to submit your vote</li>
              </ol>
              <p className="mb-4">
                Your voting power is determined by the number of tokens you hold
                for that particular community.
              </p>
            </section>

            <section
              id="chatbot"
              className="border-4 border-black bg-[#0046F4] text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-3xl font-bold mb-4">Chat Bot</h2>
              <p className="mb-4">
                The Chat Bot provides AI-powered assistance for navigating the
                platform, understanding crypto concepts, and getting market
                insights.
              </p>
              <div className="mb-6">
                <Image
                  src="/modern-chatbot-interface.png"
                  alt="Chatbot Interface"
                  width={600}
                  height={300}
                  className="border-2 border-black"
                />
              </div>
              <h3 className="text-2xl font-bold mb-2">Quick Prompts</h3>
              <p className="mb-4">
                The chatbot interface includes quick prompts to help you get
                started:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>"What's the current market trend?"</li>
                <li>"How do I create a token?"</li>
                <li>"Explain liquidity pools"</li>
                <li>"What are the trending tokens?"</li>
              </ul>
              <h3 className="text-2xl font-bold mb-2">Custom Queries</h3>
              <p className="mb-4">
                You can also ask custom questions by typing them into the chat
                input field. The chatbot will provide relevant information and
                guidance based on your query.
              </p>
            </section>

            <section
              id="tweets"
              className="border-4 border-black bg-[#FF9E00] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-3xl font-bold mb-4">My Tweets</h2>
              <p className="mb-4">
                The My Tweets section displays all your social posts on the
                platform. You can create, view, and manage your posts from here.
              </p>
              <h3 className="text-2xl font-bold mb-2">Creating a Tweet</h3>
              <p className="mb-4">To create a new tweet:</p>
              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>Navigate to the My Tweets section</li>
                <li>Click on the "New Tweet" button</li>
                <li>Enter your message in the text field</li>
                <li>Add images or other media if desired</li>
                <li>Click "Post" to publish your tweet</li>
              </ol>
              <h3 className="text-2xl font-bold mb-2">Managing Tweets</h3>
              <p className="mb-4">
                You can delete or edit your tweets by clicking on the respective
                options in the tweet card.
              </p>
            </section>

            <section
              id="token-launch"
              className="border-4 border-black bg-[#9B5DE5] text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-3xl font-bold mb-4">Token Launch</h2>
              <p className="mb-4">
                The Token Launch feature allows you to create and launch your
                own social token on the platform.
              </p>
              <h3 className="text-2xl font-bold mb-2">Creating a Token</h3>
              <p className="mb-4">To create a new token:</p>
              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>Navigate to the Launch page</li>
                <li>
                  Fill out the token creation form with details like name,
                  symbol, and supply
                </li>
                <li>Set the initial price and distribution parameters</li>
                <li>Review and confirm your token details</li>
                <li>Click "Launch Token" to create your token</li>
              </ol>
              <div className="mb-6">
                <Image
                  src="/token-launch-interface.png"
                  alt="Token Launch Form"
                  width={600}
                  height={300}
                  className="border-2 border-black"
                />
              </div>
              <h3 className="text-2xl font-bold mb-2">Token Distribution</h3>
              <p className="mb-4">
                You can specify how your token will be distributed:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong>Creator Allocation:</strong> Percentage of tokens
                  allocated to the creator
                </li>
                <li>
                  <strong>Community Allocation:</strong> Percentage of tokens
                  allocated to the community
                </li>
                <li>
                  <strong>Liquidity Pool:</strong> Percentage of tokens
                  allocated to the liquidity pool
                </li>
              </ul>
            </section>

            <section
              id="fee-sharing"
              className="border-4 border-black bg-[#00F5FF] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-3xl font-bold mb-4">Fee Sharing Mechanism</h2>
              <p className="mb-4">
                Creators earn from every trade. When the community trades your
                token through our bonding curve system, you automatically
                receive a share of the trading fees. No complex contracts, no
                manual setup—just create, grow your community, and earn as they
                engage.
              </p>

              <div className="bg-white text-black p-6 border-4 border-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-2xl font-bold mb-4">How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-[#c0ff00] p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h4 className="text-xl font-bold mb-2">
                      🏦 Trading Pool (50%)
                    </h4>
                    <p className="text-sm">
                      Maintains liquidity for seamless trading
                    </p>
                  </div>
                  <div className="bg-[#FF9E00] p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h4 className="text-xl font-bold mb-2">
                      💰 Creator Earnings (50%)
                    </h4>
                    <p className="text-sm">Direct revenue for token creators</p>
                  </div>
                </div>

                {/* Fee Distribution Chart */}
                <div className="bg-black text-white p-6 border-4 border-black mb-6">
                  <h4 className="text-xl font-bold mb-4 text-center">
                    Fee Distribution Breakdown
                  </h4>
                  <div className="flex justify-center items-center">
                    <div className="relative w-64 h-64">
                      {/* Pie Chart using CSS */}
                      <div className="w-full h-full rounded-full bg-gradient-to-r from-[#c0ff00] via-[#c0ff00] to-[#FF9E00] border-4 border-white relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 w-1/2 h-full bg-[#FF9E00] origin-left transform"></div>
                        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                      </div>
                      <div className="absolute -right-4 top-1/4 bg-[#c0ff00] text-black px-3 py-1 border-2 border-white font-bold text-sm">
                        50% Pool
                      </div>
                      <div className="absolute -left-4 bottom-1/4 bg-[#FF9E00] text-black px-3 py-1 border-2 border-white font-bold text-sm">
                        50% Creator
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-2">
                Automatic Revenue Generation
              </h3>
              <p className="mb-4">
                Every trade generates a 1% fee that's automatically split. Your
                earnings accumulate on-chain in real-time. More community
                engagement means more trading volume, which means higher creator
                earnings.
              </p>

              <div className="bg-white text-black p-4 border-l-4 border-[#00F5FF] mb-6">
                <h4 className="font-bold mb-2">💡 Example Scenario</h4>
                <p className="text-sm mb-2">
                  Your token has $10,000 in daily trading volume:
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Total fees collected: $100 (1% of volume)</li>
                  <li>• Trading pool: $50 (maintains liquidity)</li>
                  <li>
                    • <strong>Your earnings: $50 per day</strong>
                  </li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold mb-2">Instant Withdrawal</h3>
              <p className="mb-4">
                Your earnings accumulate on-chain and withdraw instantly. This
                creates direct alignment: successful communities reward their
                creators financially. Whether your token generates $100 or
                $100,000 in trading volume, you earn from every transaction.
              </p>

              <div className="bg-[#9B5DE5] text-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                <h4 className="text-xl font-bold mb-2">📊 Revenue Tracking</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white text-black p-3 border-2 border-black">
                    <div className="text-2xl font-bold">15.3</div>
                    <div className="text-xs">SUI Earned</div>
                  </div>
                  <div className="bg-white text-black p-3 border-2 border-black">
                    <div className="text-2xl font-bold">247</div>
                    <div className="text-xs">Total Trades</div>
                  </div>
                  <div className="bg-white text-black p-3 border-2 border-black">
                    <div className="text-2xl font-bold">$1,247</div>
                    <div className="text-xs">Volume Generated</div>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-2">
                How to Access Your Earnings
              </h3>
              <p className="mb-4">Accessing your creator earnings is simple:</p>
              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>Visit your token's page in the marketplace</li>
                <li>
                  Look for the "Creator Tools" section (visible only to you)
                </li>
                <li>View your accumulated fees</li>
                <li>
                  Click "Withdraw Fees" to transfer earnings to your wallet
                </li>
              </ol>

              <div className="bg-black text-white p-4 border-4 border-white font-mono text-sm overflow-x-auto">
                <div className="mb-2">
                  🎯 <strong>Pro Tip:</strong> Build an active community to
                  maximize trading volume and earnings!
                </div>
                <div>
                  💡 <strong>Remember:</strong> No setup required - earnings
                  start accumulating from your first trade.
                </div>
              </div>
            </section>

            <section
              id="marketplace"
              className="border-4 border-black bg-[#F15BB5] text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-3xl font-bold mb-4">Marketplace</h2>
              <p className="mb-4">
                The Marketplace is where you can discover, buy, and sell social
                tokens.
              </p>
              <h3 className="text-2xl font-bold mb-2">Browsing Tokens</h3>
              <p className="mb-4">
                The Marketplace displays a list of available tokens with key
                information such as price, market cap, and volume. You can
                filter and sort tokens based on various criteria.
              </p>
              <h3 className="text-2xl font-bold mb-2">Token Details</h3>
              <p className="mb-4">
                Clicking on a token will take you to its detailed page, where
                you can see:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Price chart</li>
                <li>Token information</li>
                <li>Community activity</li>
                <li>Governance proposals</li>
              </ul>
              <h3 className="text-2xl font-bold mb-2">Trading Tokens</h3>
              <p className="mb-4">To buy or sell a token:</p>
              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>Navigate to the token's page</li>
                <li>Click on "Buy" or "Sell"</li>
                <li>Enter the amount you want to buy or sell</li>
                <li>Review the transaction details</li>
                <li>Confirm the transaction</li>
              </ol>
            </section>

            <section
              id="governance"
              className="border-4 border-black bg-[#00BBF9] text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-3xl font-bold mb-4">Governance</h2>
              <p className="mb-4">
                Governance is a key feature of Kensei, allowing token holders to
                participate in decision-making for their communities.
              </p>
              <h3 className="text-2xl font-bold mb-2">Proposal Types</h3>
              <p className="mb-4">
                There are several types of proposals you can create:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <strong>Text Proposals:</strong> General proposals for
                  discussion and voting
                </li>
                <li>
                  <strong>Parameter Change:</strong> Proposals to change
                  community parameters
                </li>
                <li>
                  <strong>Treasury Allocation:</strong> Proposals to allocate
                  community treasury funds
                </li>
                <li>
                  <strong>Feature Request:</strong> Proposals to request new
                  features for the community
                </li>
              </ul>
              <h3 className="text-2xl font-bold mb-2">Voting Mechanism</h3>
              <p className="mb-4">
                Voting power is determined by the number of tokens you hold.
                Each token represents one vote. Proposals require a majority
                vote to pass, and the voting period typically lasts for 7 days.
              </p>
            </section>

            <section
              id="api"
              className="border-4 border-black bg-[#c0ff00] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-3xl font-bold mb-4">API Reference</h2>
              <p className="mb-4">
                Kensei provides a comprehensive API for developers to build
                applications on top of the platform.
              </p>
              <h3 className="text-2xl font-bold mb-2">Authentication</h3>
              <p className="mb-4">
                To authenticate with the API, you'll need to generate an API key
                from your account settings. Include this key in the
                Authorization header of your requests.
              </p>
              <div className="bg-black text-white p-4 rounded-md mb-6 font-mono text-sm overflow-x-auto">
                <pre>
                  {`
// Example API request
const response = await fetch('https://api.kensei.com/v1/tokens', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
                  `}
                </pre>
              </div>
              <h3 className="text-2xl font-bold mb-2">Endpoints</h3>
              <p className="mb-4">Here are some of the key API endpoints:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <code className="bg-black text-white px-1 rounded">
                    /v1/tokens
                  </code>{" "}
                  - Get a list of all tokens
                </li>
                <li>
                  <code className="bg-black text-white px-1 rounded">
                    /v1/tokens/{"{id}"}
                  </code>{" "}
                  - Get details for a specific token
                </li>
                <li>
                  <code className="bg-black text-white px-1 rounded">
                    /v1/users/{"{id}"}/holdings
                  </code>{" "}
                  - Get a user's token holdings
                </li>
                <li>
                  <code className="bg-black text-white px-1 rounded">
                    /v1/proposals
                  </code>{" "}
                  - Get a list of all proposals
                </li>
                <li>
                  <code className="bg-black text-white px-1 rounded">
                    /v1/proposals/{"{id}"}
                  </code>{" "}
                  - Get details for a specific proposal
                </li>
              </ul>
              <p className="mb-4">
                For full API documentation, visit our{" "}
                <Link href="#" className="text-black underline font-bold">
                  Developer Portal
                </Link>
                .
              </p>
            </section>

            <div className="border-4 border-black bg-[#0046F4] text-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
              <p className="mb-4">
                If you have any questions or need further assistance, please
                don't hesitate to reach out to our support team.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="#"
                  className="bg-black text-white px-6 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] transition-all"
                >
                  Contact Support
                </Link>
                <Link
                  href="https://x.com/thekenseiclub"
                  className="bg-[#c0ff00] text-black px-6 py-3 font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Follow us on X (Twitter)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

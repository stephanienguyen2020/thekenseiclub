/**
 * Test Client for Betting API Endpoints
 *
 * This is a simple Node.js script to test the API endpoints.
 * Run it with: node test-client.js
 */

// Base URL - replace with your actual deployment URL
const BASE_URL = "http://localhost:3000";

// Example payload for creating a bet
const createBetPayload = {
  twitterHandle: "example_user",
  title: "Will Bitcoin reach $100k by the end of 2024?",
  description:
    "This bet is about whether Bitcoin will reach a price of $100,000 USD by December 31st, 2024.",
  category: "Crypto",
  endDate: Math.floor(new Date("2024-12-31T23:59:59Z").getTime() / 1000), // Unix timestamp for Dec 31, 2024
  amount: ethers.parseEther("0.000001"), // 1 ETH in wei
  initialPoolAmount: ethers.parseEther("0.000001"), // 1 ETH in wei
  imageURL: "https://example.com/bitcoin.jpg",
};

// Example payload for joining a bet
const joinBetPayload = {
  twitterHandle: "example_user",
  betId: 1, // Replace with an actual bet ID
  support: true, // true for YES, false for NO
};

// Function to test creating a bet
async function testCreateBet() {
  try {
    const response = await fetch(`${BASE_URL}/api/bets/create-for-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createBetPayload),
    });

    const data = await response.json();
    console.log("Create Bet Response:", data);
    return data;
  } catch (error) {
    console.error("Error creating bet:", error);
  }
}

// Function to test joining a bet
async function testJoinBet() {
  try {
    const response = await fetch(`${BASE_URL}/api/bets/join-for-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(joinBetPayload),
    });

    const data = await response.json();
    console.log("Join Bet Response:", data);
    return data;
  } catch (error) {
    console.error("Error joining bet:", error);
  }
}

// Run tests
async function runTests() {
  console.log("Testing Create Bet API...");
  const createResult = await testCreateBet();

  if (createResult && createResult.success) {
    // Update the bet ID for joining
    joinBetPayload.betId = createResult.betId;

    console.log("\nTesting Join Bet API...");
    await testJoinBet();
  }
}

runTests();

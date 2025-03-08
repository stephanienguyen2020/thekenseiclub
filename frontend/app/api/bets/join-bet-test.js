// Test client for just testing the join-bet endpoint
const { ethers } = require("ethers");

async function testJoinBet() {
  const twitterHandle = "example_user"; // Using the registered Twitter handle
  const betId = 2; // Try a different bet ID
  const support = true; // true = supporting the bet

  try {
    console.log(
      `Joining bet ${betId} with position: ${support ? "Support" : "Against"}`
    );

    const response = await fetch(
      "http://localhost:3000/api/bets/join-for-user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twitterHandle,
          betId,
          support,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Bet joined successfully");
      console.log("Transaction hash:", data.transactionHash);
      console.log("Redirect URL:", data.redirectUrl);
    } else {
      console.log("❌ Failed to join bet");
      console.log("Error:", data.error);
      console.log("Message:", data.message);
    }
  } catch (error) {
    console.error("Error in API call:", error);
  }
}

// Run the test
testJoinBet();

// Test client for just testing the create-bet endpoint
const { ethers } = require("ethers");

async function testCreateBet() {
  const twitterHandle = "example_user"; // Replace with your registered Twitter handle

  try {
    // Use fixed small values that ethers can handle
    const joinAmountWei = "4000000000000"; // 0.000004 ETH in wei (fixed value)
    const initialPoolAmountWei = "4000000000000"; // 0.000004 ETH in wei (fixed value)

    console.log(
      `Creating bet with joinAmount: 0.000004 ETH, initialPoolAmount: 0.000004 ETH`
    );

    const response = await fetch(
      "http://localhost:3000/api/bets/create-for-user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twitterHandle,
          title: "Direct Test Bet",
          description: "This is a direct test of the create bet endpoint",
          category: "Test",
          endDate: Math.floor(Date.now() / 1000) + 604800, // 7 days from now (86400 * 7)
          amount: joinAmountWei,
          initialPoolAmount: initialPoolAmountWei,
          imageURL: "/placeholder.svg",
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Bet created successfully");
      console.log("Transaction hash:", data.transactionHash);
      console.log("Bet ID:", data.betId);
      console.log("Redirect URL:", data.redirectUrl);
    } else {
      console.log("❌ Failed to create bet");
      console.log("Error:", data.error);
      console.log("Message:", data.message);
    }
  } catch (error) {
    console.error("Error in API call:", error);
  }
}

// Run the test
testCreateBet();

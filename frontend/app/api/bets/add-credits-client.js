// Test client for purchasing bet credits
const { ethers } = require("ethers");

async function purchaseBetCredits() {
  const twitterHandle = "example_user"; // Replace with actual Twitter handle
  const ethAmount = 0.00001; // Amount of ETH to purchase credits with

  try {
    console.log(
      `Attempting to purchase ${ethAmount} ETH worth of bet credits for ${twitterHandle}`
    );
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseURL}/api/bets/add-credits`,
      {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        twitterHandle,
        credits: ethAmount,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Bet credits purchased successfully");
      console.log("Message:", data.message);
      console.log("Transaction hash:", data.transactionHash);
      console.log("User address:", data.userAddress);

      // Now let's try to create a bet with the credits
      console.log("\n----- Testing bet creation with credits -----");
      await testCreateBet(twitterHandle);
    } else {
      console.log("❌ Failed to purchase bet credits");
      console.log("Error:", data.error);
      console.log("Message:", data.message);
    }
  } catch (error) {
    console.error("Error in API call:", error);
  }
}

async function testCreateBet(twitterHandle) {
  try {
    // Use fixed small values that ethers can handle
    const joinAmountWei = "4000000000000"; // 0.000004 ETH in wei (fixed value)
    const initialPoolAmountWei = "4000000000000"; // 0.000004 ETH in wei (fixed value)

    console.log(
      `Creating bet with joinAmount: 0.000004 ETH, initialPoolAmount: 0.000004 ETH`
    );
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseURL}/api/bets/create-for-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twitterHandle,
          title: "Micro Test Bet",
          description: "This is a test bet with very small amounts",
          category: "Test",
          endDate: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
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
purchaseBetCredits();

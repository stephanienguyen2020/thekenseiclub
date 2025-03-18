// Test client for registering Twitter handles

async function registerTwitterHandle() {
  const twitterHandle = "example_user"; // Replace with actual Twitter handle

  try {
    console.log(`Attempting to register Twitter handle: ${twitterHandle}`);
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    // Using testMode to bypass signature verification
    const response = await fetch(
      `${baseURL}/api/bets/register-twitter`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twitterHandle,
          testMode: true,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Twitter handle registered successfully");
      console.log("Transaction hash:", data.transactionHash);
      console.log("Redirect URL:", data.redirectUrl);
    } else {
      console.log("❌ Failed to register Twitter handle");
      console.log("Error:", data.error);
      console.log("Message:", data.message);
    }

    // Now let's try to create a bet with the registered handle
    console.log("\n----- Testing bet creation with registered handle -----");
    await testCreateBet(twitterHandle);
  } catch (error) {
    console.error("Error in API call:", error);
  }
}

async function testCreateBet(twitterHandle) {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const response = await fetch(
      `${baseURL}/api/bets/create-for-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twitterHandle,
          title: "Test Bet",
          description:
            "This is a test bet created after registering a Twitter handle",
          category: "Test",
          endDate: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
          amount: "100000000000000000", // 0.1 ETH in wei
          initialPoolAmount: "500000000000000000", // 0.5 ETH in wei
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
registerTwitterHandle();

/*
Note: This is a simplified test client.
In a real-world implementation:
1. You would need to actually sign the message with a user's wallet using ethers.js
2. The message should be something unique that verifies the user owns both the wallet and Twitter handle
3. The endpoint would need to verify this signature properly
*/

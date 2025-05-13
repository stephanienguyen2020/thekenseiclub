import { getClient } from "../src/utils/sui-utils";
import { DaoSDK } from "../src";
import { Network } from "../src/utils/sui-utils";
import "dotenv/config";

// Configuration (replace with your actual values from the package deployment)
const address = "0x89052a175017eb52f49d24e7de1f48b0c38c6b1d67f9fc4e471420524e4dc2d4"; // Your address

// These values need to be replaced with actual values after the Move contract is published
const daoPackageId = process.env.DAO_PACKAGE_ID || "0x123";
const daoObjectId = process.env.DAO_OBJECT_ID || "0x456";

// Check if we have valid IDs
const isValidSetup = daoPackageId.length >= 66 && daoObjectId.length >= 66;

// Use the specified network or default to testnet
const network = (process.env.NETWORK || "testnet") as Network;
const client = getClient(network);

console.log(`Using network: ${network}`);

const daoSdk = new DaoSDK(daoObjectId, client, daoPackageId);

async function testCreateProposal() {
    if (!isValidSetup) {
        console.log("Skipping test: Please set valid package ID and DAO object ID values.");
        console.log("To use this test, you must first deploy the Move contract and set the proper object IDs.");
        return;
    }

    try {
        console.log("Creating a new proposal...");
        
        // Create dates for the proposal
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(now.getDate() + 3); // End date is 3 days from now
        
        const result = await daoSdk.createProposal({
            title: "Test Proposal",
            description: "This is a test proposal created by the SDK",
            options: ["Yes", "No", "Abstain"],
            tokenType: "0x2::sui::SUI", // Use SUI as the voting token
            createdAt: now,
            startDate: now,
            endDate: endDate,
            address,
        });

        console.log("Proposal created successfully!");
        console.log("Transaction digest:", result.digest);

        // Wait a moment for the transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Get the DAO info and newly created proposal
        const daoInfo = await daoSdk.getDAOInfo();
        console.log("DAO info:", daoInfo);

        const proposalId = daoInfo.nextProposalId - 1;
        const proposal = await daoSdk.getProposal(proposalId);
        console.log("New proposal:", proposal);
    } catch (error) {
        console.error("Error creating proposal:", error);
    }
}

async function testVoting() {
    try {
        console.log("Getting active proposals...");
        const activeProposals = await daoSdk.getActiveProposals();
        console.log("Active proposals:", activeProposals);
        if (activeProposals.length === 0) {
            console.log("No active proposals found. Create a proposal first.");
            return;
        }

        const proposalToVote = activeProposals[1];
        console.log("Voting on proposal:", proposalToVote.id);

        // Vote for the first option with 10 SUI voting power
        const result = await daoSdk.vote({
            proposalId: proposalToVote.id,
            optionIndex: 0,
            votingPower: 10, // 10 SUI voting power
            address,
        });

        console.log("Vote cast successfully!");
        console.log("Transaction digest:", result.digest);

        // Wait a moment for the transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check if vote was recorded
        const hasVoted = await daoSdk.hasVoted(proposalToVote.id, address);
        console.log("Has voted:", hasVoted);

        // Get updated proposal details
        const updatedProposal = await daoSdk.getProposal(proposalToVote.id);
        console.log("Updated proposal vote count:", updatedProposal?.totalVotes);
        console.log("Updated proposal vote points:", updatedProposal?.votePoints);
    } catch (error) {
        console.error("Error voting on proposal:", error);
    }
}

async function testCloseProposal() {
    try {
        console.log("Checking for expired proposals...");
        const expiredProposals = await daoSdk.getExpiredOpenProposals();

        if (expiredProposals.length === 0) {
            console.log("No expired proposals found that can be closed.");
            return;
        }

        const proposalToClose = expiredProposals[0];
        console.log("Closing proposal:", proposalToClose.id);
        console.log("Proposal details:", proposalToClose);

        // Get all voters who participated in this proposal
        const voters = Object.keys(proposalToClose.votes);
        console.log(`Found ${voters.length} voters for this proposal`);

        // Create intentional vote weights to ensure a specific winner
        // For testing, we'll make the second option win
        const voterBalances = [];
        
        for (let i = 0; i < voters.length; i++) {
            const voterAddress = voters[i];
            const optionVotedFor = proposalToClose.votes[voterAddress];
            
            // Give higher balances to voters who voted for option 1 to make it win
            let tokenBalance = 10; // Default balance
            
            if (optionVotedFor === 1) { // If they voted for option 1
                tokenBalance = 100; // Give them 10x more tokens
            }
            
            voterBalances.push({
                address: voterAddress,
                balance: tokenBalance
            });
        }

        console.log("Voter balances for testing:", voterBalances);
        console.log("Current vote points before closing:", proposalToClose.votePoints);

        const result = await daoSdk.closeProposal({
            proposalId: proposalToClose.id,
            voterBalances,
            address,
        });

        console.log("Proposal closed successfully!");
        console.log("Transaction digest:", result.digest);

        // Wait a moment for the transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Get closed proposal details
        const closedProposal = await daoSdk.getProposal(proposalToClose.id);
        console.log("Closed proposal status:", closedProposal?.status);
        console.log("Vote points after closing:", closedProposal?.votePoints);
        console.log("Winning option:", closedProposal?.winningOption);
        
        // Verify if our intended winner (option 1) was chosen
        // Get the index of the maximum vote points
        const winningIndex = closedProposal?.votePoints.indexOf(
            Math.max(...(closedProposal?.votePoints || []))
        );
        
        console.log("Winning option index:", winningIndex);
        console.log("Option at winning index:", closedProposal?.options[winningIndex || 0]);
        
        if (winningIndex === 1) {
            console.log("TEST PASSED: Option 1 won as expected due to higher token weight");
        } else {
            console.log("TEST FAILED: Expected option 1 to win");
        }
    } catch (error) {
        console.error("Error closing proposal:", error);
    }
}

async function getAllProposals() {
    try {
        console.log("Getting all proposals...");
        const allProposals = await daoSdk.getAllProposals();
        console.log(`Found ${allProposals.length} proposals:`);

        for (const proposal of allProposals) {
            console.log(`- ID: ${proposal.id}`);
            console.log(`  Title: ${proposal.title}`);
            console.log(`  Status: ${proposal.status}`);
            console.log(`  Total votes: ${proposal.totalVotes}`);
            console.log(`  Created by: ${proposal.createdBy}`);
            console.log(`  End time: ${proposal.endTime.toISOString()}`);
            console.log('');
        }

        console.log("Active proposals:", (await daoSdk.getActiveProposals()).length);
        console.log("Closed proposals:", (await daoSdk.getClosedProposals()).length);
        console.log("Expired proposals that should be closed:", (await daoSdk.getExpiredOpenProposals()).length);
    } catch (error) {
        console.error("Error getting proposals:", error);
    }
}

async function testBuildTransactions() {
    if (!isValidSetup) {
        console.log("Skipping test: Please set valid package ID and DAO object ID values.");
        return;
    }

    try {
        console.log("\n=== Testing Transaction Building ===");
        
        // Create dates for the proposal
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(now.getDate() + 3); // End date is 3 days from now
        
        // Build a create proposal transaction
        console.log("Building create proposal transaction...");
        const createTx = daoSdk.buildCreateProposalTransaction({
            title: "Test Proposal",
            description: "This is a test proposal built with the SDK",
            options: ["Yes", "No", "Abstain"],
            tokenType: "0x2::sui::SUI", // Use SUI as the voting token
            createdAt: now,
            startDate: now,
            endDate: endDate,
        });
        
        console.log("Create proposal transaction built successfully");
        
        // Build a vote transaction
        console.log("Building vote transaction...");
        const voteTx = daoSdk.buildVoteTransaction({
            proposalId: 0,
            optionIndex: 0,
            votingPower: 10,
        });
        
        console.log("Vote transaction built successfully");
        
        // Build a close proposal transaction
        console.log("Building close proposal transaction...");
        const closeTx = daoSdk.buildCloseProposalTransaction({
            proposalId: 0,
            voterBalances: [
                { address: "0x123", balance: 10 },
                { address: "0x456", balance: 20 }
            ]
        });
        
        console.log("Close proposal transaction built successfully");
        
        console.log("All transactions built successfully. These can be used with custom transaction execution flows.");
    } catch (error) {
        console.error("Error building transactions:", error);
    }
}

/**
 * Test the full token-weighted voting workflow
 */
async function testTokenWeightedVoting() {
    if (!isValidSetup) {
        console.log("Skipping test: Please set valid package ID and DAO object ID values.");
        return;
    }

    try {
        console.log("\n=== Testing Token-Weighted Voting ===");
        
        // 1. Create a proposal with a short voting period
        console.log("1. Creating a test proposal with short voting period...");
        
        const now = new Date();
        const endDate = new Date();
        endDate.setMinutes(now.getMinutes() + 2); // End date is just 2 minutes from now for testing
        
        const createResult = await daoSdk.createProposal({
            title: "Token-Weighted Test",
            description: "Testing the token-weighted voting mechanism",
            options: ["Option A", "Option B", "Option C"],
            tokenType: "0x2::sui::SUI", // Use SUI as the voting token
            createdAt: now,
            startDate: now,
            endDate: endDate,
            address,
        });
        
        console.log("Proposal created successfully:", createResult.digest);
        
        // Get the proposal ID of the newly created proposal
        const daoInfo = await daoSdk.getDAOInfo();
        const proposalId = daoInfo.nextProposalId - 1;
        console.log(`Created proposal with ID: ${proposalId}`);
        
        // 2. Vote on the proposal with different options
        console.log("\n2. Voting on the proposal with different addresses...");
        
        // For this test, we'll just use the same address for all votes
        // In a real test, you would use different addresses
        
        // Vote for Option A with default voting power
        await daoSdk.vote({
            proposalId,
            optionIndex: 0, // Option A
            votingPower: 1, // Default voting power
            address,
        });
        
        console.log("Voted for Option A");
        
        // In a real scenario, you would have multiple addresses voting
        // For this test, we'll simulate the different votes in the closing phase
        
        // 3. Wait for the proposal to expire
        console.log("\n3. Waiting for proposal to expire...");
        console.log(`Current time: ${new Date().toISOString()}`);
        console.log(`End time: ${endDate.toISOString()}`);
        console.log("Waiting for 2 minutes 30 seconds...");
        
        await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000 + 30 * 1000));
        
        console.log("Time elapsed, checking if proposal is expired...");
        const expiredProposals = await daoSdk.getExpiredOpenProposals();
        const targetProposal = expiredProposals.find(p => p.id === proposalId);
        
        if (!targetProposal) {
            console.log("Proposal not found in expired list. Test cannot continue.");
            return;
        }
        
        // 4. Close the proposal with simulated token balances
        console.log("\n4. Closing proposal with simulated token balances...");
        
        // Create simulated token balances to make Option B the winner
        // Since we can't actually modify the proposal's votes map in Move,
        // we'll just simulate token weights by giving your existing vote much higher weight
        
        // Get the address that voted (in this case, your address)
        const voterAddress = address;
        
        // We assign a high balance to make it the clear winner
        const voterBalances = [
            {
                address: voterAddress, // The address that voted for Option A
                balance: 10000        // Give it a high token balance
            }
        ];
        
        console.log("Voter balances for closing:", voterBalances);
        
        // Close the proposal
        const closeResult = await daoSdk.closeProposal({
            proposalId: targetProposal.id,
            voterBalances,
            address,
        });
        
        console.log("Proposal closed successfully:", closeResult.digest);
        
        // 5. Verify the winner
        console.log("\n5. Verifying the winner...");
        
        // Wait a moment for the transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
            const closedProposal = await daoSdk.getProposal(targetProposal.id);
            
            if (!closedProposal) {
                console.log("Could not fetch closed proposal. Test failed.");
                return;
            }
            
            console.log("Closed proposal status:", closedProposal.status);
            console.log("Vote points after closing:", closedProposal.votePoints);
            console.log("Options:", closedProposal.options);
            console.log("Winning option:", closedProposal.winningOption);
            
            // If the proposal was successfully closed, Option A should win since it's the only one with votes
            if (closedProposal.status === "closed" && closedProposal.winningOption === "Option A") {
                console.log("✅ TEST PASSED: Option A won as expected since it's the only option with votes");
            } else {
                console.log("❌ TEST FAILED: Expected Option A to win and proposal to be closed");
            }
        } catch (error) {
            console.log("Error fetching closed proposal:", error);
            console.log("This may be due to the transaction still processing. Please check the proposal manually.");
        }
        
    } catch (error) {
        console.error("Error in token-weighted voting test:", error);
    }
}

// Uncomment the function you want to run
// testCreateProposal();
// testVoting();
// testCloseProposal();
// getAllProposals();

// Or run a sequence of operations - uncomment to run all tests in sequence
// /*
async function runAllTests() {
    if (!isValidSetup) {
        console.log("Tests cannot run without valid package ID and DAO object ID.");
        console.log("Please deploy the Move contract first and update the test file with the correct IDs.");
        console.log(`Current values: daoPackageId=${daoPackageId}, daoObjectId=${daoObjectId}`);
        return;
    }

    // await testCreateProposal();
    // await testVoting();
    // await getAllProposals();
    // await testCloseProposal();
    // await testBuildTransactions();
    
    // To run the full token-weighted voting test, uncomment the line below
    await testTokenWeightedVoting();
}

runAllTests();
// */ 
import { getClient } from "../src/utils/sui-utils";
import { DaoSDK } from "../src";
import "dotenv/config";

// Configuration (replace with your actual values from the package deployment)
const address = "0x89052a175017eb52f49d24e7de1f48b0c38c6b1d67f9fc4e471420524e4dc2d4"; // Your address

// These values need to be replaced with actual values after the Move contract is published
const daoPackageId = process.env.DAO_PACKAGE_ID || "0x123";
const daoObjectId = process.env.DAO_OBJECT_ID || "0x456";

// Check if we have valid IDs
const isValidSetup = daoPackageId.length >= 66 && daoObjectId.length >= 66;

// Use testnet for consistent testing
const client = getClient("devnet");

const daoSdk = new DaoSDK(daoObjectId, client, daoPackageId);

async function testCreateProposal() {
    if (!isValidSetup) {
        console.log("Skipping test: Please set valid package ID and DAO object ID values.");
        console.log("To use this test, you must first deploy the Move contract and set the proper object IDs.");
        return;
    }

    try {
        console.log("Creating a new proposal...");
        const result = await daoSdk.createProposal({
            title: "Test Proposal",
            description: "This is a test proposal created by the SDK",
            options: ["Yes", "No", "Abstain"],
            durationDays: 3,
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

        const proposalToVote = activeProposals[0];
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

        const result = await daoSdk.closeProposal({
            proposalId: proposalToClose.id,
            address,
        });

        console.log("Proposal closed successfully!");
        console.log("Transaction digest:", result.digest);

        // Wait a moment for the transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Get closed proposal details
        const closedProposal = await daoSdk.getProposal(proposalToClose.id);
        console.log("Closed proposal status:", closedProposal?.status);
        console.log("Winning option:", closedProposal?.winningOption);
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
    // testVoting();
    // testCloseProposal();
    getAllProposals();

    // Other tests...
}

runAllTests();
// */ 
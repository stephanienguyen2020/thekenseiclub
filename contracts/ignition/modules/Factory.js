// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
// create  deployment script
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("hardhat");

const FEE = ethers.parseUnits("0.01", 18)

module.exports = buildModule("FactoryModule", (m) => {
    // Get the agent wallet from private key
    const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY;
    if (!AGENT_PRIVATE_KEY) {
        throw new Error("AGENT_PRIVATE_KEY not set in environment variables");
    }

    // Create agent wallet instance
    const agentWallet = new ethers.Wallet(AGENT_PRIVATE_KEY);
    const agentAddress = agentWallet.address;

    // set up the fee for the contract
    const fee = m.getParameter("fee", FEE);

    // Deploy Factory contract first
    const factory = m.contract("Factory", [FEE]);

    // Deploy Native Liquidity Pool Contract
    const liquidityPool = m.contract("NativeLiquidityPool", [factory]);

    // Set Liquidity Pool in Factory contract
    m.call(factory, "setLiquidityPool", [liquidityPool]);

    // Deploy LaunchpadAgent with Factory address and agent address
    const launchpadAgent = m.contract("LaunchpadAgent", [factory, agentAddress]);

    // return all contracts
    return { factory, liquidityPool, launchpadAgent };
});

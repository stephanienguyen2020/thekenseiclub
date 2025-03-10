require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
      version: '0.8.28',
      settings: {
          optimizer: {
              enabled: true,
              runs: 100,
          },
      },
  },

  gasReporter: {
      enabled: true,
  },

  contractSizer: {
      alphaSort: true,
      disambiguatePaths: false,
      runOnCompile: true,
      strict: false,
      // only: [':ERC20$'],
  },

  // allowUnlimitedContractSize: true,
  networks: {
    sonic_blaze_testnet: {
      url: "https://rpc.blaze.soniclabs.com",
      chainId: 57054, // Replace with the correct chain ID
      accounts: ["ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"] // Use environment variables instead for security
    }
  }
};

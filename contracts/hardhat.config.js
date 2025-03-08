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
    },
    electroneum_testnet: {
      url: "https://rpc.ankr.com/electroneum_testnet/a37dd6e77e11f999c0ca58d263db0f160cd081bb788feecd4c256902084993b9",
      chainId: 5201420,
      accounts: ["0c6aaedebed8f32db344a74f5fda724c42a1b7053450ebfecd29ba0e0922dd6b"] // Use environment variables instead for security
    }
  }
};

// require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config();

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.28",
//   networks: {
//     aurora_testnet: {
//       url: "https://testnet.aurora.dev",
//       chainId: 1313161555, // Replace with the correct chain ID
//       accounts: ["ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"] // Use environment variables instead for security
//     }
//   }
// };

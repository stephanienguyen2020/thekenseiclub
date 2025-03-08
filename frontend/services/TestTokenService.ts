import { ethers } from "ethers";
import { useWalletClient } from "wagmi";
import Factory from "../abi/Factory.json";
import Token from "../abi/Token.json";
import NativeLiquidityPool from "../abi/NativeLiquidityPool.json";
import { config } from "../app/config/contract_addresses";
import { pinFileToIPFS, pinJSONToIPFS, unPinFromIPFS } from "@/app/lib/pinata";
import { useCallback } from "react";
import { Contract, ContractInterface } from "ethers";

interface TokenSale {
  token: string;
  name: string;
  creator: string;
  sold: any;
  raised: any;
  isOpen: boolean;
  metadataURI: string;
}

interface GetTokensOptions {
  isCreator?: boolean;
  isOpen?: boolean;
}

interface FactoryContract extends ethers.BaseContract {
  create(
    name: string,
    ticker: string,
    metadataURI: string,
    creator: string,
    overrides?: any
  ): Promise<any>;
  fee(): Promise<bigint>;
  getTokenSale(index: number): Promise<TokenSale>;
  totalTokens(): Promise<number>;
  getPriceForTokens(token: string, amount: bigint): Promise<bigint>;
  buy(token: string, amount: bigint, overrides?: any): Promise<any>;
}

type ConfigType = {
  [key: number]: {
    factory: { address: string };
    nativeLiquidityPool: { address: string };
    LaunchpadAgent: { address: string };
  };
};

const typedConfig = config as ConfigType;

export const useTestTokenService = () => {
  const { data: walletClient, isError: walletError } = useWalletClient();

  const getContractAddress = useCallback(() => {
    const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337;
    const contractAddress =
      config[chainId as keyof typeof config]?.factory?.address;
    if (!contractAddress) {
      throw new Error(
        `Factory contract address not found for chain ID ${chainId}`
      );
    }
    return contractAddress;
  }, []);

  const initializeProvider = useCallback(async () => {
    if (!walletClient) {
      throw new Error("Wallet client not found. Please connect your wallet.");
    }

    if (walletError) {
      throw new Error("Error connecting to wallet. Please try again.");
    }

    try {
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      return { provider, signer };
    } catch (error) {
      console.error("Error initializing provider:", error);
      throw new Error("Failed to initialize wallet provider.");
    }
  }, [walletClient, walletError]);

  const testGetTokens = useCallback(
    async (options: GetTokensOptions = {}) => {
      try {
        const { provider, signer } = await initializeProvider();
        const contractAddress = getContractAddress();
        const factory = new ethers.Contract(contractAddress, Factory, signer);

        // Get total number of tokens
        const totalTokens = await factory.totalTokens();

        // Fetch all token sales
        const tokenSalesPromises = [];
        for (let i = 0; i < totalTokens; i++) {
          tokenSalesPromises.push(factory.getTokenSale(i));
        }

        const tokenSales = await Promise.all(tokenSalesPromises);
        let filteredTokens = [...tokenSales];

        // Filter by creator if specified
        if (options.isCreator) {
          const signerAddress = await signer.getAddress();
          filteredTokens = filteredTokens.filter(
            (sale) => sale.creator.toLowerCase() === signerAddress.toLowerCase()
          );
        }

        // Filter by isOpen status if specified
        if (typeof options.isOpen === "boolean") {
          filteredTokens = filteredTokens.filter(
            (sale) => sale.isOpen === options.isOpen
          );
        }

        // Fetch metadata for each token
        const tokensWithMetadata = await Promise.all(
          filteredTokens.map(async (sale) => {
            try {
              const response = await fetch(sale.metadataURI);
              const metadata = await response.json();
              return {
                token: sale.token,
                name: sale.name,
                creator: sale.creator,
                sold: sale.sold,
                raised: sale.raised,
                isOpen: sale.isOpen,
                image: metadata.imageURI || "",
                description: metadata.description || "",
                symbol: metadata.symbol || "",
              };
            } catch (error) {
              console.log(
                `Error fetching metadata for token ${sale.token}:`,
                error
              );
              return {
                token: sale.token,
                name: sale.name,
                creator: sale.creator,
                sold: sale.sold,
                raised: sale.raised,
                isOpen: sale.isOpen,
                image: "",
                description: "",
              };
            }
          })
        );

        return tokensWithMetadata.reverse();
      } catch (error) {
        console.error("Error in testGetTokens:", error);
        throw error;
      }
    },
    [walletClient, getContractAddress, initializeProvider]
  );

  const testBuyToken = useCallback(
    async (
      tokenSale: TokenSale,
      amount: bigint
    ): Promise<{ success: boolean; error?: string }> => {
      if (!walletClient) {
        throw new Error("Wallet client not found");
      }

      try {
        if (!tokenSale.isOpen) {
          return { success: false, error: "Token sale is not open" };
        }

        const provider = new ethers.BrowserProvider(walletClient);
        const signer = await provider.getSigner();
        const contractAddress = getContractAddress();

        const factory = new ethers.Contract(contractAddress, Factory, signer);

        // Get the cost for the tokens
        const cost = await factory.getCost(tokenSale.sold);
        const totalCost = cost * amount;

        // Create the transaction
        const transaction = await factory.buy(
          tokenSale.token,
          ethers.parseUnits(amount.toString(), 18),
          { value: totalCost }
        );

        // Wait for the transaction to be mined
        const receipt = await transaction.wait();
        return { success: receipt.status === 1 };
      } catch (error: any) {
        console.error("Error buying token:", error);

        if (error.code === 4001) {
          return { success: false, error: "Transaction rejected by user" };
        } else if (error.code === -32603) {
          return {
            success: false,
            error: "Internal JSON-RPC error. Check your wallet balance.",
          };
        }

        return {
          success: false,
          error: error.message || "Unknown error occurred",
        };
      }
    },
    [walletClient, getContractAddress]
  );

  const testCreateToken = useCallback(
    async (
      metaData: { name: string; ticker: string; description: string },
      image: File
    ): Promise<{ success: boolean; imageURL?: string | null; error?: any }> => {
      if (!walletClient) {
        console.warn("Wallet client not found");
        return { success: false, error: "Wallet client not found" };
      }

      try {
        console.log("Uploading File to IPFS", "info", 1000);
        const imageIpfsHash = await pinFileToIPFS(image);

        console.log("Uploading metadata to IPFS", "info", 1000);
        const metadataURI = await pinJSONToIPFS({
          ...metaData,
          imageURI: imageIpfsHash,
        });

        const provider = new ethers.BrowserProvider(walletClient);
        const signer = await provider.getSigner();
        const contractAddress = getContractAddress();

        const factory = new ethers.Contract(contractAddress, Factory, signer);

        const fee = await factory.fee();

        const tx = await factory.create(
          metaData.name,
          metaData.ticker,
          metadataURI,
          ethers.ZeroAddress,
          { value: fee }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          return { success: true, imageURL: imageIpfsHash };
        } else {
          if (imageIpfsHash) await unPinFromIPFS(imageIpfsHash);
          if (metadataURI) await unPinFromIPFS(metadataURI);
          return { success: false, error: "Transaction failed" };
        }
      } catch (error) {
        console.error("Error in testCreateToken:", error);
        return { success: false, error };
      }
    },
    [walletClient, getContractAddress]
  );

  const testGetPriceForTokens = useCallback(
    async (tokenSale: TokenSale, amount: bigint): Promise<bigint> => {
      if (!walletClient) {
        throw new Error("Wallet client not found");
      }

      try {
        if (!tokenSale.isOpen) {
          throw new Error("Token sale is not open");
        }

        const provider = new ethers.BrowserProvider(walletClient);
        const signer = await provider.getSigner();
        const contractAddress = getContractAddress();

        const factory = new ethers.Contract(contractAddress, Factory, signer);

        const cost = await factory.getCost(tokenSale.sold);
        const totalCost = cost * amount;

        return totalCost;
      } catch (error) {
        console.error("Error in testGetPriceForTokens:", error);
        throw error;
      }
    },
    [walletClient, getContractAddress]
  );

  const testGetPurchasedTokens = useCallback(async () => {
    if (!walletClient) {
      console.warn("Wallet client not found");
      return [];
    }

    try {
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Get all tokens first
      const allTokens = await testGetTokens();

      // Check balance for each token
      const purchasedTokensPromises = allTokens.map(async (token) => {
        const tokenContract = new ethers.Contract(token.token, Token, signer);

        const balance = await tokenContract.balanceOf(userAddress);

        if (balance > BigInt(0)) {
          return {
            ...token,
            balance,
          };
        }
        return null;
      });

      const purchasedTokens = (
        await Promise.all(purchasedTokensPromises)
      ).filter((token) => token !== null);

      return purchasedTokens;
    } catch (error) {
      console.error("Error getting purchased tokens:", error);
      return [];
    }
  }, [walletClient, testGetTokens]);

  const testGetEthBalance = useCallback(async (): Promise<bigint> => {
    if (!walletClient) {
      console.warn("Wallet client not found");
      return BigInt(0);
    }

    try {
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const balance = await provider.getBalance(userAddress);
      return balance;
    } catch (error) {
      console.error("Error getting ETH balance:", error);
      return BigInt(0);
    }
  }, [walletClient]);

  const testGetTokenBalance = useCallback(
    async (tokenAddress: string): Promise<bigint> => {
      if (!walletClient) {
        console.warn("Wallet client not found");
        return BigInt(0);
      }

      try {
        const provider = new ethers.BrowserProvider(walletClient);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        const tokenContract = new ethers.Contract(tokenAddress, Token, signer);

        const balance = await tokenContract.balanceOf(userAddress);
        return balance;
      } catch (error) {
        console.error("Error getting token balance:", error);
        return BigInt(0);
      }
    },
    [walletClient]
  );

  const testGetEstimatedTokensForEth = useCallback(
    async (tokenSale: TokenSale, ethAmount: bigint) => {
      if (!walletClient) {
        console.warn("Wallet client not found");
        return BigInt(0);
      }

      try {
        if (tokenSale.isOpen === true) {
          return BigInt(0);
        }

        const provider = new ethers.BrowserProvider(walletClient);
        const signer = await provider.getSigner();
        const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337;
        const liquidityPoolAddress =
          config[chainId as keyof typeof config]?.nativeLiquidityPool?.address;

        const liquidityPool = new Contract(
          liquidityPoolAddress,
          NativeLiquidityPool,
          signer
        );

        const ethAmountEthers = ethers.parseUnits(ethAmount.toString(), 18);
        const tokens = await liquidityPool.getEstimatedTokensForEth(
          tokenSale.token,
          ethAmountEthers
        );

        return tokens;
      } catch (error) {
        console.error("Error getting estimated tokens for ETH:", error);
        return BigInt(0);
      }
    },
    [walletClient]
  );

  const testGetEstimatedEthForTokens = useCallback(
    async (tokenSale: TokenSale, tokenAmount: bigint) => {
      if (!walletClient) {
        console.warn("Wallet client not found");
        return BigInt(0);
      }

      try {
        if (tokenSale.isOpen === true) {
          return BigInt(0);
        }

        const provider = new ethers.BrowserProvider(walletClient);
        const signer = await provider.getSigner();
        const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337;
        const liquidityPoolAddress =
          config[chainId as keyof typeof config]?.nativeLiquidityPool?.address;

        const liquidityPool = new Contract(
          liquidityPoolAddress,
          NativeLiquidityPool,
          signer
        );

        const tokenAmountEthers = ethers.parseUnits(tokenAmount.toString(), 18);
        const eth = await liquidityPool.getEstimatedEthForTokens(
          tokenSale.token,
          tokenAmountEthers
        );

        return eth;
      } catch (error) {
        console.error("Error getting estimated ETH for tokens:", error);
        return BigInt(0);
      }
    },
    [walletClient]
  );

  const testSwapEthForToken = useCallback(
    async (
      token: TokenSale,
      amount: Number
    ): Promise<{ success: boolean; error?: string }> => {
      if (!walletClient) {
        console.error("Wallet client not found");
        return { success: false, error: "Wallet not connected" };
      }

      try {
        const provider = new ethers.BrowserProvider(walletClient.transport);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        if (!typedConfig[chainId]) {
          throw new Error("Unsupported network");
        }

        const liquidityPool = new Contract(
          typedConfig[chainId].nativeLiquidityPool.address,
          NativeLiquidityPool,
          signer
        );

        const ethAmountEthers = ethers.parseUnits(amount.toString(), 18);
        console.log("ethAmountEthers", ethAmountEthers);
        console.log("token.isOpen", token.isOpen);

        if (token.isOpen === true) {
          return { success: false, error: "Token is not graduated" };
        }

        const transaction = await liquidityPool.swapEthForToken(token.token, {
          value: ethAmountEthers,
        });
        const receipt = await transaction.wait();
        return { success: receipt.status === 1 };
      } catch (error: any) {
        console.error("Error swapping ETH for token:", error);
        return {
          success: false,
          error: error.message || "Unknown error occurred",
        };
      }
    },
    [walletClient]
  );

  const testSwapTokenForEth = useCallback(
    async (
      tokenSale: TokenSale,
      tokenAmount: Number
    ): Promise<{ success: boolean; error?: string }> => {
      if (!walletClient) {
        console.error("Wallet client not found");
        return { success: false, error: "Wallet not connected" };
      }

      try {
        const provider = new ethers.BrowserProvider(walletClient.transport);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        if (!typedConfig[chainId]) {
          throw new Error("Unsupported network");
        }

        const liquidityPool = new Contract(
          typedConfig[chainId].nativeLiquidityPool.address,
          NativeLiquidityPool,
          signer
        );

        const tokenAmountEthers = ethers.parseUnits(tokenAmount.toString(), 18);
        if (tokenSale.isOpen === true) {
          return { success: false, error: "Token is not graduated" };
        }

        const tokenContract = new Contract(tokenSale.token, Token, signer);

        // Approve the liquidity pool to spend tokens
        await tokenContract.approve(
          await liquidityPool.getAddress(),
          tokenAmountEthers
        );
        console.log("tokenAmountEthers", tokenAmountEthers);
        console.log("token.isOpen", tokenSale.isOpen);

        const transaction = await liquidityPool.swapTokenForEth(
          tokenSale.token,
          tokenAmountEthers
        );
        const receipt = await transaction.wait();
        return { success: receipt.status === 1 };
      } catch (error: any) {
        console.error("Error swapping token for ETH:", error);
        return {
          success: false,
          error: error.message || "Unknown error occurred",
        };
      }
    },
    [walletClient]
  );

  return {
    testCreateToken,
    testBuyToken,
    testGetTokens,
    testGetPurchasedTokens,
    testGetEthBalance,
    testGetTokenBalance,
    testGetEstimatedTokensForEth,
    testGetEstimatedEthForTokens,
    testGetPriceForTokens,
    testSwapEthForToken,
    testSwapTokenForEth,
  };
};

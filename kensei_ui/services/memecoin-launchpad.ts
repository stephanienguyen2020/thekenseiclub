import { ethers, BrowserProvider, Contract, Signer } from "ethers";
import { pinFileToIPFS, pinJSONToIPFS, unPinFromIPFS } from "@/app/lib/pinata";
import Factory from "../abi/Factory.json";
import NativeLiquidityPool from "../abi/NativeLiquidityPool.json";
import Token from "../abi/Token.json";
import { config } from "../app/config/contract_addresses";
import TokenABI from "../abi/Token.json";

// Define TypeScript interfaces
interface TokenSale {
  token: string;
  name: string;
  creator: string;
  sold: any;
  raised: any;
  isOpen: boolean;
  metadataURI: string;
}

interface Token {
  token: string;
  name: string;
  creator: string;
  sold: any;
  raised: any;
  isOpen: boolean;
  image: string;
  description: string;
  symbol: string;
}

interface ContractObjects {
  provider: any;
  signer: any;
  factory: any;
  liquidityPool: any;
}

interface ConfigType {
  [key: string]: {
    factory: { address: string };
    nativeLiquidityPool: { address: string };
  };
}

const typedConfig: ConfigType = config;

/**
 * Initializes the Ethereum provider, signer, network, factory, and liquidity pool contract.
 */
async function loadFactoryContract(): Promise<ContractObjects> {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();
  const chainId = network.chainId.toString();

  if (!typedConfig[chainId]) throw new Error("Unsupported network");

  const factory = new Contract(
    typedConfig[chainId].factory.address,
    Factory,
    signer
  );

  const liquidityPool = new Contract(
    typedConfig[chainId].nativeLiquidityPool.address,
    NativeLiquidityPool,
    signer
  );

  return { provider, signer, factory, liquidityPool };
}

/**
 * Swap ETH for tokens.
 */
export async function swapEthForToken(
  token: TokenSale,
  amount: Number
): Promise<{ success: boolean }> {
  console.log(amount);
  try {
    const { signer, liquidityPool } = await loadFactoryContract();
    const ethAmountEthers = ethers.parseUnits(amount.toString(), 18);
    console.log("ethAmountEthers", ethAmountEthers);
    console.log("token.isOpen", token.isOpen);
    if (token.isOpen === true) {
      return { success: false };
    }
    
    const transaction = await liquidityPool
      .connect(signer)
      .swapEthForToken(token.token, { value: ethAmountEthers });

    const receipt = await transaction.wait();
    return { success: receipt.status === 1 };
  } catch (error) {
    console.error("Error swapping ETH for token:", error);
    return { success: true };
  }
}

/**
 * Swap tokens for ETH.
 */
export async function swapTokenForEth(
  tokenSale: TokenSale,
  tokenAmount: Number
): Promise<{ success: boolean }> {
  try {
    const { signer, liquidityPool } = await loadFactoryContract();
    const tokenAmountEthers = ethers.parseUnits(tokenAmount.toString(), 18);
    if (tokenSale.isOpen === true) {
      return { success: false };
    }

    const tokenContract = new ethers.Contract(
      tokenSale.token,
      Token,
      signer
    );
    await tokenContract.approve(await liquidityPool.getAddress(), tokenAmountEthers);
    console.log("ethAmountEthers", tokenAmountEthers);
    console.log("token.isOpen", tokenSale.isOpen);
    const transaction = await liquidityPool
      .connect(signer)
      .swapTokenForEth(tokenSale.token, tokenAmountEthers);

    const receipt = await transaction.wait();
    return { success: receipt.status === 1 };
  } catch (error) {
    console.error("Error swapping token for ETH:", error);
    return { success: true };
  }
}

/**
 * Create a new token.
 */
export async function createToken(
  metaData: any,
  image: File
): Promise<{ success: boolean; imageURL?: string | null; error?: any }> {
  try {
    console.log("Uploading File to IPFS", "info", 1000);
    const imageIpfsHash = await pinFileToIPFS(image);

    console.log("Uploading metadata to IPFS", "info", 1000);
    const metadataURI = await pinJSONToIPFS({
      ...metaData,
      imageURI: imageIpfsHash,
    });

    const { factory, signer } = await loadFactoryContract();
    const fee = await factory.fee();

    const tx = await factory
      .connect(signer)
      .create(metaData.name, metaData.ticker, metadataURI, ethers.ZeroAddress, { value: fee });

    const receipt = await tx.wait();

    if (receipt.status === 1) {
      return { success: true, imageURL: imageIpfsHash };
    } else {
      if (imageIpfsHash && metadataURI) await unPinFromIPFS(imageIpfsHash, metadataURI);
      return { success: false, error: "Transaction failed" };
    }
  } catch (error) {
    console.error("Error in createToken:", error);
    return { success: false, error };
  }
}

/**
 * Buy tokens.
 */
export async function buyToken(
  tokenSale: TokenSale,
  amount: bigint
): Promise<{ success: boolean; error?: any }> {
  try {
    if (!tokenSale.isOpen)
      return { success: false, error: "Token sale is not open" };

    const { factory, signer } = await loadFactoryContract();

    // Check if wallet is connected
    if (!window.ethereum || !window.ethereum.selectedAddress) {
      // Trigger wallet connection dialog
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // If still not connected after dialog, return error
      if (!window.ethereum.selectedAddress) {
        return { success: false, error: "Wallet not connected" };
      }
    }

    // Get the cost for the tokens
    const cost = await factory.getCost(tokenSale.sold);
    const totalCost = cost * amount;

    console.log("totalCost", totalCost);

    // Create the transaction
    const transaction = await factory
      .connect(signer)
      .buy(tokenSale.token, ethers.parseUnits(amount.toString(), 18), {
        value: totalCost,
      });

    // Wait for the transaction to be mined
    const receipt = await transaction.wait();
    return { success: receipt.status === 1 };
  } catch (error: any) {
    console.error("Error buying token:", error);

    // Handle specific error cases
    if (error.code === 4001) {
      return { success: false, error: "Transaction rejected by user" };
    } else if (error.code === -32603) {
      return {
        success: false,
        error: "Internal JSON-RPC error. Check your wallet balance.",
      };
    }

    return { success: false, error: error.message || "Unknown error occurred" };
  }
}

/**
 * Fetch tokens with flexible filtering options.
 * @param options Optional filtering parameters
 * @param options.isOpen Filter by token sale status (open or closed)
 * @param options.isCreator Filter by tokens created by the current user
 * @returns Array of filtered tokens
 */
export async function getTokens(options?: {
  isOpen?: boolean;
  isCreator?: boolean;
}): Promise<Token[]> {
  const { factory, signer } = await loadFactoryContract();
  const totalTokens = await factory.totalTokens();
  const tokens: Token[] = [];

  // Get current user's address if we need to filter by creator
  let creatorAddress: string | undefined;
  if (options?.isCreator) {
    creatorAddress = await signer.getAddress();
  }

  for (let i = 0; i < totalTokens; ++i) {
    const tokenSale: TokenSale = await factory.getTokenSale(i);

    // Apply filters
    const matchesOpenFilter =
      options?.isOpen === undefined || tokenSale.isOpen === options.isOpen;
    const matchesCreatorFilter =
      !options?.isCreator ||
      tokenSale.creator.toLowerCase() === creatorAddress?.toLowerCase();

    if (matchesOpenFilter && matchesCreatorFilter) {
      const metadata = await fetchMetadata(tokenSale.metadataURI);

      tokens.push({
        token: tokenSale.token,
        name: tokenSale.name,
        creator: tokenSale.creator,
        sold: tokenSale.sold,
        raised: tokenSale.raised,
        isOpen: tokenSale.isOpen,
        image: metadata.imageURI,
        description: metadata.description,
        symbol: metadata.symbol,
      });
    }
  }

  return tokens.reverse();
}

/**
 * Fetch metadata from IPFS.
 */
async function fetchMetadata(
  metadataURI: string
): Promise<{ name: string; description: string; imageURI: string, symbol: string }> {
  if (!metadataURI) return { name: "Unknown", description: "", imageURI: "", symbol: "" };

  try {
    const response = await fetch(metadataURI);
    if (!response.ok) throw new Error("Failed to fetch metadata");
    return await response.json();
  } catch (error) {
    console.log(`Failed to fetch metadata for ${metadataURI}:`, error);
    return {
      name: "Unknown",
      description: "No description available",
      imageURI: "",
      symbol: "",
    };
  }
}

export async function getPriceForTokens(tokenSale: TokenSale, amount: bigint) {
  const CAP_AMOUNT = ethers.parseUnits("10000", 18); // 10,000 tokens in wei
  const MIN_AMOUNT = ethers.parseUnits("1", 18); // 1 token in wei

  // Ensure amount is correctly converted to wei (smallest unit)
  const amountInWei = ethers.parseUnits(amount.toString(), 18);

  console.log("CAP_AMOUNT:", CAP_AMOUNT.toString());
  console.log("MIN_AMOUNT:", MIN_AMOUNT.toString());
  console.log("amountInWei:", amountInWei.toString());
  console.log("amount", amount);

  // Validate amount against contract constraints
  if (
    !tokenSale.isOpen ||
    amountInWei < MIN_AMOUNT ||
    amountInWei > CAP_AMOUNT
  ) {
    return 0;
  }

  const { factory } = await loadFactoryContract();

  console.log(
    "Calling getPriceForTokens with:",
    tokenSale.token,
    amountInWei.toString()
  );

  // Call contract function
  const cost = await factory.getPriceForTokens(tokenSale.token, amountInWei);

  console.log("getPriceForTokens result:", cost.toString());

  return cost;
}

export async function getEstimatedTokensForEth(
  tokenSale: TokenSale,
  ethAmount: bigint
) {
  const ethAmountEthers = ethers.parseUnits(ethAmount.toString(), 18);
  if (tokenSale.isOpen === true) {
    return 0;
  }
  const { factory, liquidityPool } = await loadFactoryContract();
  const tokens = await liquidityPool.getEstimatedTokensForEth(
    tokenSale.token,
    ethAmountEthers
  );
  console.log("getEstimatedTokensForEth: ", getEstimatedTokensForEth);
  return tokens;
}

export async function getEstimatedEthForTokens(
  tokenSale: TokenSale,
  tokenAmount: bigint
) {
  const tokenAmountEthers = ethers.parseUnits(tokenAmount.toString(), 18);
  if (tokenSale.isOpen === true) {
    return 0;
  }
  const { factory, liquidityPool } = await loadFactoryContract();
  const eth = await liquidityPool.getEstimatedEthForTokens(
    tokenSale.token,
    tokenAmountEthers
  );
  console.log("getEstimatedEthForTokens: ", getEstimatedEthForTokens);
  return eth;
}

/**
 * Get the balance of a specific token for the current user
 * @param tokenAddress The address of the token
 * @returns The token balance as a BigInt
 */
export async function getTokenBalance(tokenAddress: string): Promise<bigint> {
  try {
    const { signer } = await loadFactoryContract();
    const userAddress = await signer.getAddress();

    // Create a minimal ERC20 interface with just the balanceOf function
    const erc20Interface = new ethers.Interface([
      "function balanceOf(address owner) view returns (uint256)",
    ]);

    // Create a contract instance
    const tokenContract = new ethers.Contract(
      tokenAddress,
      erc20Interface,
      signer
    );

    // Call balanceOf to get the user's balance
    const balance = await tokenContract.balanceOf(userAddress);
    return balance;
  } catch (error) {
    console.error("Error getting token balance:", error);
    return BigInt(0);
  }
}

/**
 * Get the ETH balance for the current user
 * @returns The ETH balance as a BigInt
 */
export async function getEthBalance(): Promise<bigint> {
  try {
    const { provider, signer } = await loadFactoryContract();
    const userAddress = await signer.getAddress();
    const balance = await provider.getBalance(userAddress);
    return balance;
  } catch (error) {
    console.error("Error getting ETH balance:", error);
    return BigInt(0);
  }
}

/**
 * Get all tokens owned by the current user (purchased tokens)
 * @returns Array of tokens with balance information
 */
export async function getPurchasedTokens(): Promise<Token[]> {
  try {
    // Get all tokens first
    const allTokens = await getTokens();
    const { signer } = await loadFactoryContract();
    const userAddress = await signer.getAddress();

    // Create a minimal ERC20 interface with just the balanceOf function
    const erc20Interface = new ethers.Interface([
      "function balanceOf(address owner) view returns (uint256)",
    ]);

    // Check each token's balance
    const purchasedTokensPromises = allTokens.map(async (token) => {
      // Create a contract instance
      const tokenContract = new ethers.Contract(
        token.token,
        erc20Interface,
        signer
      );

      // Call balanceOf to get the user's balance
      const balance = await tokenContract.balanceOf(userAddress);

      // If balance is greater than 0, user owns this token
      if (balance > BigInt(0)) {
        return {
          ...token,
          balance: balance,
        };
      }
      return null;
    });

    // Wait for all promises to resolve and filter out null values
    const purchasedTokens = (await Promise.all(purchasedTokensPromises)).filter(
      (token): token is Token & { balance: bigint } => token !== null
    );

    return purchasedTokens;
  } catch (error) {
    console.error("Error getting purchased tokens:", error);
    return [];
  }
}

/**
 * Get all tokens or tokens created by a specific address
 * @param creatorAddress Optional address of the token creator
 * @returns Array of tokens, either all tokens or those created by the specified address
 */
export async function getTokensByCreator(creatorAddress?: string): Promise<Token[]> {
  try {
    // Connect to the provider
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545"
    );
    
    const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337;
    const chainConfig = config[chainId as keyof typeof config];

    if (!chainConfig) {
      console.error(`Factory contract address not found for chain ID ${chainId}`);
      return [];
    }

    // Create factory contract instance
    const factoryContract = new ethers.Contract(
      chainConfig.factory.address,
      Factory,
      provider
    );

    const totalTokens = await factoryContract.totalTokens();
    const tokens: Token[] = [];

    for (let i = 0; i < totalTokens; i++) {
      const tokenSale: TokenSale = await factoryContract.getTokenSale(i);

      // If creatorAddress is provided, filter by creator, otherwise include all tokens
      if (!creatorAddress || tokenSale.creator.toLowerCase() === creatorAddress.toLowerCase()) {
        const metadata = await fetchMetadata(tokenSale.metadataURI);
        tokens.push({
          token: tokenSale.token,
          name: tokenSale.name,
          creator: tokenSale.creator,
          sold: Number(tokenSale.sold),
          raised: Number(tokenSale.raised),
          isOpen: tokenSale.isOpen,
          image: metadata.imageURI,
          description: metadata.description,
          symbol: metadata.symbol,
        });
      }
    }

    return tokens.reverse();
  } catch (error) {
    console.error("Error getting tokens:", error);
    return [];
  }
}

/**
 * Get detailed information about a specific token
 * @param tokenAddress The address of the token
 * @returns Detailed token information or null if not found
 */
export async function getTokenDetails(tokenAddress: string): Promise<{
  token: Token;
  marketData: {
    price: string;
    marketCap: string;
    volume24h: string;
    holders: number;
 // liquidityPool: string;
  };
} | null> {
  try {
    // Connect to the provider
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545"
    );
    
    const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337;
    const chainConfig = config[chainId as keyof typeof config];

    if (!chainConfig) {
      console.error(`Contract addresses not found for chain ID ${chainId}`);
      return null;
    }

    // Create contract instances
    const factoryContract = new ethers.Contract(
      chainConfig.factory.address,
      Factory,
      provider
    );


    // Create token contract instance with full ABI
    const tokenContract = new ethers.Contract(
      tokenAddress,
      TokenABI,
      provider
    );

    // Get all token data in parallel
    const [
      totalSupply,
    //lpBalance,
      creator,
      metadataURI,
      name,
      tokenSale
    ] = await Promise.all([
      tokenContract.totalSupply(),
      //tokenContract.balanceOf(chainConfig.nativeLiquidityPool.address),
      tokenContract.creator(),
      tokenContract.metadataURI(),
      tokenContract.name(),
      factoryContract.tokenToSale(tokenAddress)
    ]);

    // Fetch metadata
    const metadata = await fetchMetadata(metadataURI);
    
    // Calculate market data
    let price
    if (tokenSale.isOpen) {
      price = await factoryContract.getPriceForTokens(tokenAddress, ethers.parseUnits("1", 18)); // in wei
    } else {
      price = ethers.parseUnits("0", 18); // in wei
    }
    
    const marketCap = ethers.formatUnits(tokenSale.raised, 18)
    return {
      token: {
        token: tokenAddress,
        name: name,
        creator: creator,
        sold: tokenSale.sold,
        raised: Number(tokenSale.raised),
        isOpen: tokenSale.isOpen,
        image: metadata.imageURI,
        description: metadata.description,
        symbol: metadata.symbol,
      },
      marketData: {
        price: price.toString(),
        marketCap: marketCap.toString(),
        volume24h: "0", // You might want to track this separately
        holders: 0, // You might want to track this separately
       //liquidityPool: ethers.formatEther(lpBalance),
      }
    };
  } catch (error) {
    console.error("Error getting token details:", error);
    return null;
  }
}

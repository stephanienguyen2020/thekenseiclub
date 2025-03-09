"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  Info,
  Search,
  ChevronDown,
  X,
  Zap,
  Check,
  ExternalLink,
  Copy,
  ArrowDown,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getPriceForTokens,
  getEstimatedTokensForEth,
  getEstimatedEthForTokens,
  getTokenBalance,
  getEthBalance,
  swapEthForToken,
  swapTokenForEth,
} from "@/services/memecoin-launchpad";
import { ethers } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTestTokenService } from "@/services/TestTokenService";

// Define the Token interface to match what's returned by getTokens
interface Token {
  token: string;
  name: string;
  creator: string;
  sold: any;
  raised: any;
  isOpen: boolean;
  image: string;
  description: string;
}

// Define TokenSale interface to match what's needed for price estimation functions
interface TokenSale {
  token: string;
  name: string;
  creator: string;
  sold: any;
  raised: any;
  isOpen: boolean;
  metadataURI: string;
}

// Define UI token type that includes tokenData which can be null for default tokens
interface UIToken {
  symbol: string;
  name: string;
  balance: number;
  icon: string;
  change24h: string;
  price: number;
  tokenData: Token | null;
}

interface CoinSwapProps {
  symbol: string;
  isAuthenticated: boolean;
  handleTradeAction: () => void;
  marketplaceTokens?: Token[];
}

// Define token data with more details
const defaultTokens: UIToken[] = [
  {
    symbol: "S",
    name: "Sonic",
    balance: 1.2,
    icon: "⚡",
    change24h: "-0.5%",
    price: 4125,
    tokenData: null,
  },
  {
    symbol: "USDT",
    name: "Tether",
    balance: 500.0,
    icon: "💵",
    change24h: "+0.1%",
    price: 1.0,
    tokenData: null,
  },
  // ... other default tokens
];

const CoinSwap = ({
  symbol,
  isAuthenticated,
  handleTradeAction,
  marketplaceTokens = [],
}: CoinSwapProps) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const testTokenService = useTestTokenService();

  // State for token balances
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>(
    {}
  );
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Track if data has been fetched to prevent refetching
  const dataFetched = useRef(false);

  // Convert marketplace tokens to the format needed for the UI
  const marketplaceTokensFormatted: UIToken[] = marketplaceTokens.map(
    (token) => ({
      symbol: token.name.substring(0, 4).toUpperCase(),
      name: token.name,
      balance: 0, // Will be updated with real balance
      icon: "🪙", // Default icon for marketplace tokens
      change24h: "+0.0%", // This would need to be fetched from an API
      price: 0.01, // Default price, will be updated dynamically
      tokenData: token, // Store the original token data for API calls
    })
  );

  // Combine ETH with marketplace tokens
  const tokens: UIToken[] = [
    ...defaultTokens.filter((t) => t.symbol === "S"), // Only keep S from default tokens
    ...marketplaceTokensFormatted,
  ];

  // Find the token that matches the symbol or default to S
  const defaultToken = tokens.find((t) => t.symbol === symbol) || tokens[0];

  const [fromToken, setFromToken] = useState<UIToken>(defaultToken);
  // Find a graduated token for the "to" token default
  const graduatedToken = marketplaceTokensFormatted.find(
    (token) => token.tokenData && !token.tokenData.isOpen
  );
  const [toToken, setToToken] = useState<UIToken>(
    graduatedToken || defaultTokens[1]
  ); // Default to first graduated marketplace token or USDT
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [swapType, setSwapType] = useState("instant");
  const [fromSearchQuery, setFromSearchQuery] = useState("");
  const [toSearchQuery, setToSearchQuery] = useState("");
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);
  const [orderType, setOrderType] = useState("instant");
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState<string>("0");
  const [isCalculating, setIsCalculating] = useState(false);
  const [swapDirection, setSwapDirection] = useState<
    "ethToToken" | "tokenToEth"
  >("ethToToken");
  const [recipientAddress, setRecipientAddress] = useState(
    "0xf79DcD66e8bC69dae488c3E0F35e0693815bD7d6"
  );
  const [gasOnDestination, setGasOnDestination] = useState<string>("");
  const [fee, setFee] = useState<string>("");
  const [gasCost, setGasCost] = useState<string>("");
  const [estimatedTime, setEstimatedTime] = useState<string>("");

  // Update wallet connection status and trigger fetch
  useEffect(() => {
    const isConnected = !!walletClient;
    setIsWalletConnected(isConnected);

    if (isConnected) {
      // Reset dataFetched when wallet connects
      dataFetched.current = false;
      handleRefresh();
    }
  }, [walletClient]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    dataFetched.current = false;
    setIsLoadingBalances(true);
  }, []);

  // Fetch balances when wallet is connected
  useEffect(() => {
    if (!isWalletConnected || dataFetched.current) return;

    async function fetchBalances() {
      try {
        setIsLoadingBalances(true);
        dataFetched.current = true;

        // Fetch ETH balance using test function
        const ethBalanceWei = await testTokenService.testGetEthBalance();
        const formattedEthBalance = ethers.formatEther(ethBalanceWei);
        console.log("ETH Balance:", formattedEthBalance);
        setEthBalance(formattedEthBalance);

        // Update ETH token in the tokens array
        const ethToken = tokens.find((t) => t.symbol === "S");
        if (ethToken) {
          ethToken.balance = parseFloat(formattedEthBalance);
        }

        // Fetch token balances for marketplace tokens using test function
        const balancePromises = marketplaceTokensFormatted.map(
          async (token) => {
            if (token.tokenData) {
              try {
                const balance = await testTokenService.testGetTokenBalance(
                  token.tokenData.token
                );
                const formattedBalance = ethers.formatEther(balance);
                return {
                  tokenAddress: token.tokenData.token,
                  balance: formattedBalance,
                };
              } catch (error) {
                console.error(
                  `Error fetching balance for ${token.name}:`,
                  error
                );
                return { tokenAddress: token.tokenData.token, balance: "0" };
              }
            }
            return null;
          }
        );

        const balanceResults = await Promise.all(balancePromises);

        // Create a map of token address to balance
        const balanceMap: Record<string, string> = {};
        balanceResults.forEach((result) => {
          if (result) {
            balanceMap[result.tokenAddress] = result.balance;
          }
        });

        setTokenBalances(balanceMap);

        // Update token balances in the tokens array
        marketplaceTokensFormatted.forEach((token) => {
          if (token.tokenData && balanceMap[token.tokenData.token]) {
            token.balance = parseFloat(balanceMap[token.tokenData.token]);
          }
        });
      } catch (error) {
        console.error("Error fetching balances:", error);
      } finally {
        setIsLoadingBalances(false);
      }
    }

    fetchBalances();
  }, [isWalletConnected, testTokenService, marketplaceTokensFormatted]);

  // Add cleanup for wallet disconnection
  useEffect(() => {
    if (!isWalletConnected) {
      setTokenBalances({});
      setEthBalance("0");
      setIsLoadingBalances(false);
      dataFetched.current = false;
    }
  }, [isWalletConnected]);

  // Get the current balance of the selected token
  const getSelectedTokenBalance = (token: UIToken): string => {
    if (token.symbol === "S") {
      return ethBalance;
    }

    if (token.tokenData) {
      return tokenBalances[token.tokenData.token] || "0";
    }

    return "0";
  };

  // Filter tokens based on search query
  const filteredFromTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(fromSearchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(fromSearchQuery.toLowerCase())
  );

  // For "To" tokens, only show marketplace tokens when swapping from S
  // When swapping from a marketplace token, only show S
  const filteredToTokens =
    swapDirection === "ethToToken"
      ? marketplaceTokensFormatted.filter(
          (token) =>
            token.symbol.toLowerCase().includes(toSearchQuery.toLowerCase()) ||
            token.name.toLowerCase().includes(toSearchQuery.toLowerCase())
        )
      : tokens.filter(
          (token) =>
            token.symbol === "S" &&
            (token.symbol.toLowerCase().includes(toSearchQuery.toLowerCase()) ||
              token.name.toLowerCase().includes(toSearchQuery.toLowerCase()))
        );

  // Helper function to check if a token is swappable (graduated)
  const isTokenSwappable = (token: UIToken) => {
    // S is always swappable
    if (token.symbol === "S") return true;
    // For other tokens, check if they are graduated (isOpen = false)
    return token.tokenData ? !token.tokenData.isOpen : true;
  };

  // Update swap direction when tokens change
  useEffect(() => {
    if (fromToken.symbol === "S") {
      setSwapDirection("ethToToken");
    } else {
      setSwapDirection("tokenToEth");
      // If we're swapping from token to S, ensure the "to" token is S
      const sToken = tokens.find((t) => t.symbol === "S");
      if (sToken && toToken.symbol !== "S") {
        setToToken(sToken);
      }
    }
  }, [fromToken, toToken, tokens]);

  // Update price calculation
  useEffect(() => {
    const calculatePrice = async () => {
      if (
        !fromAmount ||
        isNaN(parseFloat(fromAmount)) ||
        parseFloat(fromAmount) <= 0
      ) {
        setToAmount("");
        setEstimatedPrice("0");
        return;
      }

      try {
        setIsCalculating(true);

        // Convert amount to bigint for the API calls
        const amount = BigInt(Math.floor(parseFloat(fromAmount) * 1e18));

        if (
          swapDirection === "ethToToken" &&
          fromToken.symbol === "S" &&
          toToken.tokenData
        ) {
          // ETH to Token swap
          const tokenSale: TokenSale = {
            token: toToken.tokenData.token,
            name: toToken.tokenData.name,
            creator: toToken.tokenData.creator,
            sold: toToken.tokenData.sold,
            raised: toToken.tokenData.raised,
            isOpen: toToken.tokenData.isOpen,
            metadataURI: "", // This might need to be fetched if required
          };

          const estimatedTokens =
            await testTokenService.testGetEstimatedTokensForEth(
              tokenSale,
              amount
            );
          const formattedAmount = ethers.formatUnits(estimatedTokens, 18);
          setToAmount(formattedAmount);
        } else if (
          swapDirection === "tokenToEth" &&
          toToken.symbol === "S" &&
          fromToken.tokenData
        ) {
          // Token to ETH swap
          const tokenSale: TokenSale = {
            token: fromToken.tokenData.token,
            name: fromToken.tokenData.name,
            creator: fromToken.tokenData.creator,
            sold: fromToken.tokenData.sold,
            raised: fromToken.tokenData.raised,
            isOpen: fromToken.tokenData.isOpen,
            metadataURI: "", // This might need to be fetched if required
          };

          const estimatedEth =
            await testTokenService.testGetEstimatedEthForTokens(
              tokenSale,
              amount
            );
          const formattedAmount = ethers.formatUnits(estimatedEth, 18);
          setToAmount(formattedAmount);
        }
      } catch (error) {
        console.error("Error calculating swap price:", error);
      } finally {
        setIsCalculating(false);
      }
    };

    calculatePrice();
  }, [fromAmount, fromToken, toToken, swapDirection, testTokenService]);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    // Price calculation is handled by the useEffect
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    // We don't calculate the reverse direction automatically
    // This would require implementing the reverse calculation
  };

  const handleSwapTokens = () => {
    // Only allow swapping if it's between ETH and a marketplace token
    if (
      (fromToken.symbol === "S" && toToken.tokenData) ||
      (toToken.symbol === "S" && fromToken.tokenData)
    ) {
      const temp = fromToken;
      setFromToken(toToken);
      setToToken(temp);
      setFromAmount(toAmount);
      setToAmount(fromAmount);
    }
  };

  const handleMaxClick = () => {
    // Use the real balance from our state
    const balance = getSelectedTokenBalance(fromToken);

    // If it's S, leave some for gas
    if (fromToken.symbol === "S") {
      // Leave 0.01 S for gas
      const ethBalanceNum = parseFloat(balance);
      const maxAmount = Math.max(0, ethBalanceNum - 0.01).toString();
      handleFromAmountChange(maxAmount);
    } else {
      // For tokens, use the full balance
      handleFromAmountChange(balance);
    }
  };

  // Calculate estimated fees and slippage
  const estimatedFee = fromAmount ? parseFloat(fromAmount) * 0.003 : 0;
  const estimatedSlippage =
    fromAmount && slippage
      ? parseFloat(fromAmount) * (parseFloat(slippage) / 100)
      : 0;

  // Calculate minimum received
  const minimumReceived =
    toAmount && estimatedSlippage
      ? (parseFloat(toAmount) - estimatedSlippage).toFixed(6)
      : "0";

  // Calculate USD values
  const fromUsdValue = fromAmount
    ? parseFloat(fromAmount) * fromToken.price
    : 0;
  const toUsdValue = toAmount ? parseFloat(toAmount) * toToken.price : 0;

  // Calculate gas fee based on current network conditions
  useEffect(() => {
    // This would typically come from an API or blockchain provider
    const calculateGasEstimates = async () => {
      try {
        // In a real implementation, these would be fetched from an API or blockchain
        const currentGasPrice = Math.random() * 50 + 20; // Simulated gas price in Gwei
        const estimatedGasUnits = 150000; // Typical gas units for a swap

        // Calculate gas cost in native token
        const gasCostInEth = (currentGasPrice * estimatedGasUnits) / 1e9;
        const gasCostInUsd = gasCostInEth * fromToken.price;

        // Set the dynamic values
        setGasCost(`${gasCostInEth.toFixed(5)} S`);
        setFee(`$${(fromUsdValue * 0.003).toFixed(2)}`); // 0.3% fee
        setGasOnDestination(`0.001 S`); // Small amount for destination chain gas

        // Estimate transaction time based on gas price
        const estimatedMinutes =
          currentGasPrice > 50
            ? "< 1 min"
            : currentGasPrice > 30
            ? "1-2 min"
            : "3-5 min";
        setEstimatedTime(estimatedMinutes);
      } catch (error) {
        console.error("Error calculating gas estimates:", error);
        // Set fallback values
        setGasCost("0.005 S");
        setFee("$0.50");
        setGasOnDestination("0.001 S");
        setEstimatedTime("1-3 min");
      }
    };

    if (fromAmount && parseFloat(fromAmount) > 0) {
      calculateGasEstimates();
    } else {
      // Reset values when no amount is entered
      setGasCost("0 S");
      setFee("$0.00");
      setGasOnDestination("0 S");
      setEstimatedTime("0 min");
    }
  }, [fromAmount, fromToken.price, fromUsdValue]);

  // Estimate transaction cost (gas fee) in USD for display
  const estimatedGasFee = parseFloat(gasCost.split(" ")[0]) * fromToken.price;

  // Handle the swap action
  const handleSwap = async () => {
    // Check if we're trying to swap with a non-graduated token
    if (
      (swapDirection === "ethToToken" && toToken.tokenData?.isOpen === true) ||
      (swapDirection === "tokenToEth" && fromToken.tokenData?.isOpen === true)
    ) {
      // Show an error message or alert that only graduated tokens can be swapped
      alert("Only graduated tokens can be swapped.");
      return;
    }

    // Check if the user has enough balance
    const currentBalance = parseFloat(getSelectedTokenBalance(fromToken));
    const amountToSwap = parseFloat(fromAmount);

    if (isNaN(amountToSwap) || amountToSwap <= 0) {
      alert("Please enter a valid amount to swap.");
      return;
    }

    if (amountToSwap > currentBalance) {
      alert(
        `Insufficient balance. You have ${currentBalance} ${fromToken.symbol} but are trying to swap ${amountToSwap} ${fromToken.symbol}.`
      );
      return;
    }

    try {
      // Convert amount to BigInt for the API calls
      const amount = Number(fromAmount);
      let result;

      if (swapDirection === "ethToToken" && toToken.tokenData) {
        // ETH to Token swap
        const tokenSale = {
          token: toToken.tokenData.token,
          name: toToken.tokenData.name,
          creator: toToken.tokenData.creator,
          sold: toToken.tokenData.sold,
          raised: toToken.tokenData.raised,
          isOpen: toToken.tokenData.isOpen,
          metadataURI: toToken.tokenData.image || "", // Use image URL as metadataURI
        };

        // Call the test swap function
        result = await testTokenService.testSwapEthForToken(tokenSale, amount);
      } else if (swapDirection === "tokenToEth" && fromToken.tokenData) {
        // Token to ETH swap
        const tokenSale = {
          token: fromToken.tokenData.token,
          name: fromToken.tokenData.name,
          creator: fromToken.tokenData.creator,
          sold: fromToken.tokenData.sold,
          raised: fromToken.tokenData.raised,
          isOpen: fromToken.tokenData.isOpen,
          metadataURI: fromToken.tokenData.image || "", // Use image URL as metadataURI
        };

        // Call the test swap function
        result = await testTokenService.testSwapTokenForEth(tokenSale, amount);
      } else {
        alert("Invalid swap configuration");
        return;
      }

      // Check if the swap was successful
      if (!result.success) {
        alert(result.error || "Swap failed. Please try again.");
        return;
      }

      // In a real app, this would call a blockchain transaction
      // For demo purposes, we'll just show the success dialog after a short delay
      if (handleTradeAction) {
        handleTradeAction();
      }

      // Generate a mock transaction hash (in a real app, this would come from the blockchain)
      const mockTxHash =
        "0xf79DcD66e8bC69dae488c3E0F35e069381" +
        Math.floor(Math.random() * 1000000)
          .toString(16)
          .padStart(6, "0");
      setTransactionHash(mockTxHash);
      setShowSuccess(true);

      // Update balances after successful swap
      updateBalancesAfterSwap();
    } catch (error) {
      console.error("Error during swap:", error);
      alert("An error occurred during the swap. Please try again.");
    }
  };

  // Update balances after a successful swap
  const updateBalancesAfterSwap = async () => {
    if (!isConnected || !walletClient) return;

    try {
      // Fetch updated balances
      const ethBalanceWei = await testTokenService.testGetEthBalance();
      const formattedEthBalance = ethers.formatEther(ethBalanceWei);
      setEthBalance(formattedEthBalance);

      // Update ETH token in the tokens array
      const ethToken = tokens.find((t) => t.symbol === "S");
      if (ethToken) {
        ethToken.balance = parseFloat(formattedEthBalance);
      }

      // If we swapped a token, update its balance
      if (swapDirection === "tokenToEth" && fromToken.tokenData) {
        const tokenBalance = await testTokenService.testGetTokenBalance(
          fromToken.tokenData.token
        );
        const formattedBalance = ethers.formatEther(tokenBalance);

        // Update the balance in our state
        setTokenBalances((prev) => ({
          ...prev,
          [fromToken.tokenData!.token]: formattedBalance,
        }));

        // Update the token in the tokens array
        const token = marketplaceTokensFormatted.find(
          (t) => t.tokenData && t.tokenData.token === fromToken.tokenData!.token
        );
        if (token) {
          token.balance = parseFloat(formattedBalance);
        }
      } else if (swapDirection === "ethToToken" && toToken.tokenData) {
        const tokenBalance = await testTokenService.testGetTokenBalance(
          toToken.tokenData.token
        );
        const formattedBalance = ethers.formatEther(tokenBalance);

        // Update the balance in our state
        setTokenBalances((prev) => ({
          ...prev,
          [toToken.tokenData!.token]: formattedBalance,
        }));

        // Update the token in the tokens array
        const token = marketplaceTokensFormatted.find(
          (t) => t.tokenData && t.tokenData.token === toToken.tokenData!.token
        );
        if (token) {
          token.balance = parseFloat(formattedBalance);
        }
      }
    } catch (error) {
      console.error("Error updating balances after swap:", error);
    }
  };

  // Create a Sonic token logo component
  const SonicLogo = () => (
    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
      <img
        src="https://s2.coinmarketcap.com/static/img/coins/200x200/32684.png"
        alt="Sonic"
        className="w-full h-full object-cover"
      />
    </div>
  );

  // Update the token icon display in the token selection UI
  const renderTokenIcon = (token: UIToken) => {
    if (token.symbol === "S") {
      return <SonicLogo />;
    }

    if (token.tokenData?.image) {
      return (
        <img
          src={token.tokenData.image}
          alt={token.name}
          className="w-6 h-6 rounded-full"
        />
      );
    }

    return (
      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white">
        {token.icon}
      </div>
    );
  };

  return (
    <Card className="bg-[#1A1B1E] border-none w-full overflow-visible shadow-xl">
      <div className="relative">
        <CardContent className="p-6">
          {!showSuccess ? (
            <>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3 mb-4 text-sm text-blue-400 flex items-start">
                <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Note:</strong> Only graduated tokens (where isOpen =
                  false) can be swapped. Tokens that are still in the sale phase
                  cannot be traded.
                </div>
              </div>

              {!isConnected && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 mb-4 text-sm text-yellow-400 flex items-start">
                  <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <strong>Wallet not connected:</strong> Please connect your
                    wallet to view your balances and make trades.
                  </div>
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <Button
                        className="ml-2 bg-yellow-500 hover:bg-yellow-600 text-black"
                        onClick={openConnectModal}
                      >
                        Connect
                      </Button>
                    )}
                  </ConnectButton.Custom>
                </div>
              )}

              {isLoadingBalances && isConnected && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3 mb-4 text-sm text-green-400 flex items-start">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-400 mr-2 mt-0.5"></div>
                  <div>
                    <strong>Loading balances:</strong> Please wait while we
                    fetch your token balances...
                  </div>
                </div>
              )}

              {/* Order Type Selector */}
              <div className="mb-6">
                <div className="bg-[#2A2B2E] rounded-xl p-1 flex">
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium ${
                      orderType === "instant"
                        ? "bg-[#353538] text-white"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                    onClick={() => setOrderType("instant")}
                  >
                    <Zap className="h-4 w-4" />
                    Instant
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* From Token */}
                <div className="bg-[#2A2B2E] rounded-2xl p-4">
                  <div className="flex justify-between mb-2">
                    <div className="text-sm text-gray-400">You pay</div>
                    <div className="text-sm text-gray-400">
                      Available:{" "}
                      <span className="text-gray-300">
                        {isLoadingBalances ? (
                          <span className="animate-pulse">Loading...</span>
                        ) : (
                          <span>
                            {parseFloat(
                              getSelectedTokenBalance(fromToken)
                            ).toFixed(4)}{" "}
                            {fromToken.symbol}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-12 px-3 bg-[#353538] hover:bg-[#404043] rounded-xl flex items-center gap-2"
                        >
                          <span className="text-xl">
                            {renderTokenIcon(fromToken)}
                          </span>
                          <span className="text-white font-medium">
                            {fromToken.symbol}
                          </span>
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0 bg-[#1A1B1E] border-[#353538]">
                        <div className="p-2">
                          <div className="flex items-center border border-[#353538] rounded-md bg-[#2A2B2E]">
                            <Search className="h-4 w-4 ml-2 text-gray-400" />
                            <Input
                              placeholder="Search tokens..."
                              value={fromSearchQuery}
                              onChange={(e) =>
                                setFromSearchQuery(e.target.value)
                              }
                              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            {fromSearchQuery && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0 mr-1"
                                onClick={() => setFromSearchQuery("")}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto py-1">
                          {filteredFromTokens.map((token) => (
                            <div
                              key={token.symbol}
                              className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#2A2B2E] ${
                                fromToken.symbol === token.symbol
                                  ? "bg-[#2A2B2E]"
                                  : ""
                              } ${
                                !isTokenSwappable(token) ? "opacity-50" : ""
                              }`}
                              onClick={() => {
                                if (!isTokenSwappable(token)) {
                                  alert(
                                    "Only graduated tokens can be swapped."
                                  );
                                  return;
                                }
                                setFromToken(token);
                                setIsFromOpen(false);
                                if (fromAmount) {
                                  handleFromAmountChange(fromAmount);
                                }
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xl">
                                  {renderTokenIcon(token)}
                                </span>
                                <div className="flex flex-col">
                                  <span className="font-medium text-white">
                                    {token.symbol}
                                    {token.tokenData && (
                                      <span
                                        className={`ml-2 text-xs px-1 py-0.5 rounded ${
                                          isTokenSwappable(token)
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-yellow-500/20 text-yellow-400"
                                        }`}
                                      >
                                        {isTokenSwappable(token)
                                          ? "Graduated"
                                          : "Not Graduated"}
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {token.name}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-sm text-gray-300">
                                  {isLoadingBalances ? (
                                    <span className="animate-pulse">
                                      Loading...
                                    </span>
                                  ) : token.symbol === "S" ? (
                                    parseFloat(ethBalance).toFixed(4)
                                  ) : token.tokenData ? (
                                    parseFloat(
                                      tokenBalances[token.tokenData.token] ||
                                        "0"
                                    ).toFixed(4)
                                  ) : (
                                    "0.0000"
                                  )}
                                </span>
                                <span
                                  className={`text-xs ${
                                    token.change24h.startsWith("+")
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {token.change24h}
                                </span>
                              </div>
                            </div>
                          ))}
                          {filteredFromTokens.length === 0 && (
                            <div className="px-3 py-4 text-center text-gray-400">
                              No tokens found
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <div className="flex-1 relative">
                      <Input
                        type="text"
                        placeholder="0.0"
                        value={fromAmount}
                        onChange={(e) => handleFromAmountChange(e.target.value)}
                        className="bg-transparent border-none text-right text-xl text-white focus-visible:ring-0 p-0 pr-16"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMaxClick}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs px-2 py-1 h-6 bg-[#353538] border-[#454548] text-green-400 hover:bg-[#404043]"
                      >
                        Max
                      </Button>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400 mt-1">
                    ≈ ${fromUsdValue.toFixed(2)}
                  </div>
                </div>

                {/* Swap Button */}
                <div className="relative flex justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 z-10 rounded-xl bg-[#2A2B2E] border border-[#353538] hover:bg-[#353538]"
                    onClick={handleSwapTokens}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* To Token */}
                <div className="bg-[#2A2B2E] rounded-2xl p-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <div className="text-sm text-gray-400">You receive</div>
                    <div className="text-sm text-gray-400">
                      Balance:{" "}
                      <span className="text-gray-300">
                        {isLoadingBalances ? (
                          <span className="animate-pulse">Loading...</span>
                        ) : (
                          <span>
                            {parseFloat(
                              getSelectedTokenBalance(toToken)
                            ).toFixed(4)}{" "}
                            {toToken.symbol}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Popover open={isToOpen} onOpenChange={setIsToOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-12 px-3 bg-[#353538] hover:bg-[#404043] rounded-xl flex items-center gap-2"
                        >
                          <span className="text-xl">
                            {renderTokenIcon(toToken)}
                          </span>
                          <span className="text-white font-medium">
                            {toToken.symbol}
                          </span>
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0 bg-[#1A1B1E] border-[#353538]">
                        <div className="p-2">
                          <div className="flex items-center border border-[#353538] rounded-md bg-[#2A2B2E]">
                            <Search className="h-4 w-4 ml-2 text-gray-400" />
                            <Input
                              placeholder="Search tokens..."
                              value={toSearchQuery}
                              onChange={(e) => setToSearchQuery(e.target.value)}
                              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            {toSearchQuery && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0 mr-1"
                                onClick={() => setToSearchQuery("")}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto py-1">
                          {filteredToTokens.map((token) => (
                            <div
                              key={token.symbol}
                              className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#2A2B2E] ${
                                toToken.symbol === token.symbol
                                  ? "bg-[#2A2B2E]"
                                  : ""
                              } ${
                                !isTokenSwappable(token) ? "opacity-50" : ""
                              }`}
                              onClick={() => {
                                if (!isTokenSwappable(token)) {
                                  alert(
                                    "Only graduated tokens can be swapped."
                                  );
                                  return;
                                }
                                setToToken(token);
                                setIsToOpen(false);
                                if (fromAmount) {
                                  handleFromAmountChange(fromAmount);
                                }
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xl">
                                  {renderTokenIcon(token)}
                                </span>
                                <div className="flex flex-col">
                                  <span className="font-medium text-white">
                                    {token.symbol}
                                    {token.tokenData && (
                                      <span
                                        className={`ml-2 text-xs px-1 py-0.5 rounded ${
                                          isTokenSwappable(token)
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-yellow-500/20 text-yellow-400"
                                        }`}
                                      >
                                        {isTokenSwappable(token)
                                          ? "Graduated"
                                          : "Not Graduated"}
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {token.name}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-sm text-gray-300">
                                  {isLoadingBalances ? (
                                    <span className="animate-pulse">
                                      Loading...
                                    </span>
                                  ) : token.symbol === "S" ? (
                                    parseFloat(ethBalance).toFixed(4)
                                  ) : token.tokenData ? (
                                    parseFloat(
                                      tokenBalances[token.tokenData.token] ||
                                        "0"
                                    ).toFixed(4)
                                  ) : (
                                    "0.0000"
                                  )}
                                </span>
                                <span
                                  className={`text-xs ${
                                    token.change24h.startsWith("+")
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {token.change24h}
                                </span>
                              </div>
                            </div>
                          ))}
                          {filteredToTokens.length === 0 && (
                            <div className="px-3 py-4 text-center text-gray-400">
                              No tokens found
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Input
                      type="text"
                      placeholder="0.0"
                      value={toAmount}
                      onChange={(e) => handleToAmountChange(e.target.value)}
                      className="bg-transparent border-none text-right text-xl text-white focus-visible:ring-0 p-0 flex-1"
                    />
                  </div>
                  <div className="text-right text-sm text-gray-400 mt-1">
                    ≈ ${toUsdValue.toFixed(2)}
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="bg-[#2A2B2E] rounded-xl p-4 space-y-3">
                  {/* Price Info */}
                  <div className="flex justify-between items-center text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-gray-400 flex items-center gap-1 cursor-help">
                            Price <Info className="h-4 w-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1A1B1E] border-[#353538]">
                          <p>Current exchange rate</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="text-gray-300 flex items-center gap-1">
                      <span className="flex items-center gap-1">
                        1 {renderTokenIcon(fromToken)} {fromToken.symbol}
                      </span>
                      <span>=</span>
                      <span className="flex items-center gap-1">
                        {estimatedPrice} {renderTokenIcon(toToken)}{" "}
                        {toToken.symbol}
                      </span>
                    </div>
                  </div>

                  {/* Recipient Address */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-400">Recipient Address</div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 text-sm truncate max-w-[180px]">
                        {recipientAddress.substring(0, 12)}...
                        {recipientAddress.substring(
                          recipientAddress.length - 6
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Transaction Cost */}
                  <div className="flex justify-between items-center text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-gray-400 flex items-center gap-1 cursor-help">
                            Transaction cost <Info className="h-4 w-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1A1B1E] border-[#353538]">
                          <p>Estimated gas fee for this transaction</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300">
                        ≈ ${estimatedGasFee.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Slippage Settings */}
                  <div className="flex justify-between items-center text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-gray-400 flex items-center gap-1 cursor-help">
                            Slippage Tolerance <Info className="h-4 w-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1A1B1E] border-[#353538]">
                          <p>Maximum price change you're willing to accept</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {["0.1", "0.5", "1.0"].map((value) => (
                          <Button
                            key={value}
                            variant={slippage === value ? "default" : "outline"}
                            size="sm"
                            className={`h-6 px-2 text-xs ${
                              slippage === value
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-[#353538] border-[#454548] text-gray-300"
                            }`}
                            onClick={() => setSlippage(value)}
                          >
                            {value}%
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Gas on destination */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-400">Gas on destination</div>
                    <div className="text-gray-300">{gasOnDestination}</div>
                  </div>

                  {/* Fee */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-400">Fee</div>
                    <div className="text-gray-300">{fee}</div>
                  </div>

                  {/* Gas cost */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-400">Gas cost</div>
                    <div className="text-gray-300">{gasCost}</div>
                  </div>

                  {/* Estimated time for transfer */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-400">
                      Estimated time for transfer
                    </div>
                    <div className="text-gray-300">{estimatedTime}</div>
                  </div>

                  {fromAmount && parseFloat(fromAmount) > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-gray-400 flex items-center gap-1 cursor-help">
                              Minimum Received <Info className="h-4 w-4" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#1A1B1E] border-[#353538]">
                            <p>
                              Minimum amount you'll receive after slippage (
                              {slippage}%)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="text-gray-300">
                        {minimumReceived} {toToken.symbol}
                      </div>
                    </div>
                  )}
                </div>

                {/* Swap Button */}
                <Button
                  className="w-full h-14 text-lg font-medium mt-4 bg-blue-400 hover:bg-blue-500 text-white rounded-xl"
                  onClick={!isConnected ? () => {} : handleSwap}
                  disabled={
                    isConnected &&
                    (isLoadingBalances ||
                      !fromAmount ||
                      parseFloat(fromAmount) <= 0 ||
                      parseFloat(fromAmount) >
                        parseFloat(getSelectedTokenBalance(fromToken)))
                  }
                >
                  {!isConnected ? (
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <div onClick={openConnectModal} className="w-full">
                          Connect Wallet
                        </div>
                      )}
                    </ConnectButton.Custom>
                  ) : isLoadingBalances ? (
                    "Loading Balances..."
                  ) : !fromAmount || parseFloat(fromAmount) <= 0 ? (
                    "Enter Amount"
                  ) : parseFloat(fromAmount) >
                    parseFloat(getSelectedTokenBalance(fromToken)) ? (
                    "Insufficient Balance"
                  ) : swapDirection === "ethToToken" ? (
                    `Swap ${fromToken.symbol} for ${toToken.symbol}`
                  ) : (
                    `Swap ${fromToken.symbol} for ${toToken.symbol}`
                  )}
                </Button>
              </div>
            </>
          ) : (
            // Success View (in-component instead of modal)
            <div className="flex flex-col items-center text-center space-y-6 py-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 via-green-400 to-green-500 flex items-center justify-center">
                <Check className="h-10 w-10 text-black" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-medium text-white">
                  Transfer has been completed!
                </h2>
                <div className="text-gray-400 flex items-center justify-center gap-2">
                  <span className="flex items-center gap-1">
                    {renderTokenIcon(fromToken)} {fromAmount} {fromToken.symbol}
                  </span>
                  <span>→</span>
                  <span className="flex items-center gap-1">
                    {renderTokenIcon(toToken)} {toAmount} {toToken.symbol}
                  </span>
                </div>
              </div>

              <div className="space-y-4 w-full">
                {/* Transaction Details */}
                <div className="space-y-3 w-full">
                  {/* Transaction Hash */}
                  <div className="bg-[#2A2B2E] rounded-xl p-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-400">Transaction Hash</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm truncate mr-2">
                        {transactionHash}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white p-1 h-auto"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Additional Transaction Details */}
                  <div className="bg-[#2A2B2E] rounded-xl p-4 space-y-3">
                    {/* Recipient Address */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="text-gray-400">Recipient Address</div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-sm truncate max-w-[180px]">
                          {recipientAddress.substring(0, 12)}...
                          {recipientAddress.substring(
                            recipientAddress.length - 6
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white p-1 h-auto"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>

                    {/* Slippage */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="text-gray-400">Slippage</div>
                      <div className="text-gray-300">{slippage}%</div>
                    </div>

                    {/* Gas on destination */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="text-gray-400">Gas on destination</div>
                      <div className="text-gray-300">{gasOnDestination}</div>
                    </div>

                    {/* Fee */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="text-gray-400">Fee</div>
                      <div className="text-gray-300">{fee}</div>
                    </div>

                    {/* Gas cost */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="text-gray-400">Gas cost</div>
                      <div className="text-gray-300">{gasCost}</div>
                    </div>

                    {/* Estimated time for transfer */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="text-gray-400">
                        Estimated time for transfer
                      </div>
                      <div className="text-gray-300">{estimatedTime}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <Button
                    variant="ghost"
                    className="flex-1 text-gray-400 hover:text-white"
                  >
                    View in Explorer <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>

                  <Button
                    className="flex-1 bg-green-400 hover:bg-green-500 text-white"
                    onClick={() => setShowSuccess(false)}
                  >
                    New Swap
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default CoinSwap;

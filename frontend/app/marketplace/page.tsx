"use client";

import { SiteHeader } from "../components/site-header";
import { Footer } from "../components/Footer";
import { Input } from "@/components/ui/input";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Twitter,
  Shield,
  TextIcon as Telegram,
  Clock,
  TrendingUp,
  Filter,
  ArrowUpDown,
  Wallet,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { MarketFilters } from "../components/MarketFilters";
import type { Chain, FilterOption, MemeToken } from "../components/types";
import Marquee from "react-fast-marquee";
import { AppLayout } from "../components/app-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTokenStore } from "../store/tokenStore";
import { getTokens, getPriceForTokens } from "@/services/memecoin-launchpad";
import { ethers, id } from "ethers";
import { error } from "console";
import page from "../page";
import { useTestTokenService } from "@/services/TestTokenService";
import { useAccount, useWalletClient } from "wagmi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DEFAULT_TOKEN_IMAGE = "/placeholder.svg";
const DEFAULT_CHAIN_LOGO = "/chain-placeholder.svg";

const chains: Chain[] = [
  {
    id: "bsc",
    name: "BSC",
    logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
  },
  {
    id: "solana",
    name: "Solana",
    logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
  },
  {
    id: "polygon",
    name: "Polygon",
    logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
  },
  {
    id: "avalanche",
    name: "Avalanche",
    logo: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
  },
] as const;

const filterOptions: FilterOption[] = [
  { id: "latest", label: "Latest", icon: Clock },
  { id: "trending", label: "Trending", icon: TrendingUp },
] as const;

const mockTokens: MemeToken[] = [
  {
    name: "Doge Wisdom",
    symbol: "WISE",
    description: "Much wisdom, very insight, wow!",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/013/564/doge.jpg",
    price: "0",
    marketCap: "7.3k",
    priceChange: 0.41,
    fundingRaised: "0",
    chain: "ethereum",
  },
  {
    name: "Pepe Rare",
    symbol: "RARE",
    description: "The rarest Pepe in existence",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/017/618/pepefroggie.jpg",
    price: "0",
    marketCap: "7.3k",
    priceChange: -9.74,
    fundingRaised: "0",
    chain: "solana",
  },
  {
    name: "Wojak Finance",
    symbol: "WOJAK",
    description: "He bought? Dump it.",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/031/671/cover1.jpg",
    price: "0",
    marketCap: "7.3k",
    priceChange: -3.48,
    fundingRaised: "0",
    chain: "solana",
  },
  {
    name: "Cheems Bonk",
    symbol: "BONK",
    description: "The legendary Cheems brings good fortune",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/033/421/cover2.jpg",
    price: "0",
    marketCap: "7.3k",
    priceChange: 6.83,
    fundingRaised: "0",
    chain: "bsc",
  },
  {
    name: "Gigachad Token",
    symbol: "CHAD",
    description: "Yes, I buy memecoins. How could you tell?",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/026/152/gigachad.jpg",
    price: "0",
    marketCap: "7.3k",
    priceChange: 12.45,
    fundingRaised: "0",
    chain: "avalanche",
  },
  {
    name: "Stonks Master",
    symbol: "STONK",
    description: "Only goes up! Financial genius!",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/029/959/Screen_Shot_2019-06-05_at_1.26.32_PM.jpg",
    price: "0",
    marketCap: "7.3k",
    priceChange: 8.21,
    fundingRaised: "0",
    chain: "polygon",
  },
  {
    name: "Nyan Cat Classic",
    symbol: "NYAN",
    description: "Pop-tart cat traversing the galaxy",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/000/976/Nyan_Cat.jpg",
    price: "0",
    marketCap: "7.3k",
    priceChange: -5.67,
    fundingRaised: "0",
    chain: "ethereum",
  },
  {
    name: "This Is Fine",
    symbol: "FINE",
    description: "Everything is absolutely fine",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/018/012/this_is_fine.jpeg",
    price: "0",
    marketCap: "7.3k",
    priceChange: 3.92,
    fundingRaised: "0",
    chain: "bsc",
  },
  {
    name: "Distracted BF",
    symbol: "SIMP",
    description: "When you see another meme coin pumping",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/023/732/damngina.jpg",
    price: "0",
    marketCap: "8.1k",
    priceChange: 15.32,
    fundingRaised: "0",
    chain: "avalanche",
  },
  {
    name: "Moon Soon",
    symbol: "MOON",
    description: "To the moon! Any minute now...",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/022/444/hiltonmoon.jpg",
    price: "0",
    marketCap: "5.2k",
    priceChange: -2.15,
    fundingRaised: "0",
    chain: "polygon",
  },
  {
    name: "Galaxy Brain",
    symbol: "BRAIN",
    description: "Big brain moves only",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/030/525/cover5.png",
    price: "0",
    marketCap: "9.4k",
    priceChange: 7.84,
    fundingRaised: "0",
    chain: "ethereum",
  },
  {
    name: "Sad Pablo",
    symbol: "SAD",
    description: "When your portfolio is down bad",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/026/489/crying.jpg",
    price: "0",
    marketCap: "3.5k",
    priceChange: -12.45,
    fundingRaised: "0",
    chain: "solana",
  },
];

// Update the MemeToken interface to include the new properties
interface ExtendedMemeToken extends MemeToken {
  id?: string;
  token?: string;
  volume24h?: string;
  holders?: string;
  launchDate?: string;
  status?: "active" | "inactive" | "paused";
  creator?: string;
}

const TokenCard = ({
  token,
  index,
}: {
  token: ExtendedMemeToken;
  index: number;
}) => {
  const needsMarquee = token.name.length > 15;
  const [imageError, setImageError] = useState(false);

  // Determine the token identifier to use in the URL
  // Prefer token address if available, otherwise use symbol
  const tokenIdentifier = token.token || token.symbol;

  console.log(
    `TokenCard ${index} - Name: ${token.name}, Symbol: ${token.symbol}, Token ID: ${tokenIdentifier}`
  );

  return (
    <div className="w-full group">
      <div className="relative overflow-hidden bg-black border rounded-2xl border-white/10">
        {/* Image Container */}
        <Link href={`/token/${tokenIdentifier}`} className="block">
          <div className="relative flex items-center justify-center overflow-hidden bg-gray-900 aspect-square">
            {/* Background placeholder */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `url(${DEFAULT_TOKEN_IMAGE})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: imageError ? 1 : 0.5,
              }}
            />

            {/* Next.js Image with error handling */}
            {!imageError && (
              <Image
                src={
                  token.imageUrl && token.imageUrl.startsWith("http")
                    ? token.imageUrl
                    : token.imageUrl || DEFAULT_TOKEN_IMAGE
                }
                alt={token.name}
                width={400}
                height={400}
                className="absolute inset-0 object-cover w-full h-full"
                priority={index < 4}
                onError={() => setImageError(true)}
                unoptimized={
                  !!(token.imageUrl && token.imageUrl.startsWith("http"))
                }
                style={{ maxWidth: "100%" }}
              />
            )}

            {/* Price Change Badge */}
            <div className="absolute z-20 top-4 right-4">
              <div className="bg-black/90 rounded-lg px-2.5 py-1 border border-white/10">
                <div className="flex items-center gap-1">
                  {token.priceChange > 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-blue-400" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
                  )}
                  <span
                    className={`text-[11px] font-medium ${
                      token.priceChange > 0 ? "text-blue-400" : "text-red-400"
                    }`}
                  >
                    {Math.abs(token.priceChange).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <Link href={`/token/${tokenIdentifier}`}>
                    <h3 className="text-sm font-medium text-white transition-colors hover:text-blue-400">
                      {needsMarquee ? (
                        <div className="w-[120px] overflow-hidden">
                          <Marquee gradient={false} speed={20}>
                            <span>{token.name}</span>
                            <span className="mx-2">•</span>
                          </Marquee>
                        </div>
                      ) : (
                        token.name
                      )}
                    </h3>
                  </Link>
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] font-mono"
                  >
                    ${token.symbol}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] font-mono bg-white/5 border-white/10"
                >
                  Rank #{index + 1}
                </Badge>
                {index < 3 && (
                  <Badge className="h-5 px-1.5 text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    Trending
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm font-medium text-white">
                ${token.price}
              </div>
              <div className="text-[10px] text-gray-500">
                MC: ${token.marketCap}
              </div>
            </div>
          </div>

          <p className="mt-3 text-[13px] text-gray-400 line-clamp-2">
            {token.description}
          </p>

          {/* Token Metrics */}
          <div className="grid grid-cols-2 gap-4 py-3 mt-3 border-y border-white/10">
            <div>
              <div className="text-[10px] text-gray-500 mb-0.5">Volume 24h</div>
              <div className="font-mono text-sm font-medium text-white">
                {token.volume24h}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 mb-0.5">Holders</div>
              <div className="font-mono text-sm font-medium text-white">
                {token.holders}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
                <Globe className="h-3.5 w-3.5 text-gray-500 hover:text-white" />
              </button>
              <button className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
                <Twitter className="h-3.5 w-3.5 text-gray-500 hover:text-white" />
              </button>
              <button className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
                <Telegram className="h-3.5 w-3.5 text-gray-500 hover:text-white" />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[10px] text-gray-500">Verified</span>
            </div>
          </div>

          {/* Buy Button */}
          <div className="mt-4">
            <Link href={`/token/${tokenIdentifier}`}>
              <Button className="w-full" size="sm">
                Buy {token.symbol}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<FilterOption["id"]>("latest");
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [realTokens, setRealTokens] = useState<ExtendedMemeToken[]>([]);
  const itemsPerPage = 8;

  // Get tokens from store and wallet connection state
  const storeTokens = useTokenStore((state) => state.tokens);
  const testTokenService = useTestTokenService();
  const { data: walletClient } = useWalletClient();
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Track if data has been fetched to prevent refetching
  const dataFetched = useRef(false);

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
    setIsLoading(true);
  }, []);

  // Fetch tokens from the blockchain
  useEffect(() => {
    if (!isWalletConnected || dataFetched.current) return;

    async function fetchTokens() {
      try {
        setIsLoading(true);
        dataFetched.current = true;

        const tokens = await testTokenService.testGetTokens({ isOpen: true });

        if (!tokens || tokens.length === 0) {
          setRealTokens([]);
          setIsLoading(false);
          return;
        }

        // Process tokens and get prices
        const formattedTokensPromises = tokens.map(async (token) => {
          let tokenPrice = "0";
          if (token.isOpen) {
            try {
              const tokenSaleData = {
                token: token.token,
                name: token.name,
                creator: token.creator,
                sold: token.sold,
                raised: token.raised,
                isOpen: token.isOpen,
                metadataURI: token.image || "",
              };

              const price = await testTokenService.testGetPriceForTokens(
                tokenSaleData,
                BigInt(1)
              );
              tokenPrice = ethers.formatEther(price);
            } catch (error) {
              console.error(
                `Error fetching price for token ${token.name}:`,
                error
              );
              tokenPrice = "0";
            }
          }

          return {
            id: token.token,
            token: token.token,
            name: token.name,
            symbol: token.name.substring(0, 4).toUpperCase(),
            description: token.description || "No description available",
            imageUrl: token.image || DEFAULT_TOKEN_IMAGE,
            price: tokenPrice,
            marketCap: (Number(token.raised) / 1e18).toFixed(2) + "k",
            priceChange: Math.random() * 20 - 10,
            fundingRaised: token.raised.toString(),
            chain: "ethereum",
            volume24h: "$" + (Math.random() * 100000).toFixed(2),
            holders: (Math.random() * 1000).toFixed(0),
            launchDate: new Date().toISOString().split("T")[0],
            status: "active" as const,
            creator: token.creator,
          };
        });

        const formattedTokens = await Promise.all(formattedTokensPromises);
        setRealTokens(formattedTokens.filter(Boolean) as ExtendedMemeToken[]);
      } catch (error) {
        console.error("Error fetching tokens:", error);
        setRealTokens([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTokens();
  }, [isWalletConnected, testTokenService]);

  // Combine mock tokens with store tokens and real tokens
  const allTokens = useMemo(() => {
    // If not connected, show mock tokens
    if (!isWalletConnected) {
      return mockTokens.map((token) => ({
        ...token,
        id: token.symbol,
        token: token.symbol,
        volume24h: "$" + (Math.random() * 100000).toFixed(2),
        holders: (Math.random() * 1000).toFixed(0),
        launchDate: new Date().toISOString().split("T")[0],
        status: "active" as const,
        fundingRaised: "0",
        imageUrl: token.imageUrl || DEFAULT_TOKEN_IMAGE,
      })) as ExtendedMemeToken[];
    }

    // If connected and we have real tokens, show them
    if (realTokens.length > 0) {
      return realTokens;
    }

    // If connected but no real tokens yet, show mock tokens
    return mockTokens.map((token) => ({
      ...token,
      id: token.symbol,
      token: token.symbol,
      volume24h: "$" + (Math.random() * 100000).toFixed(2),
      holders: (Math.random() * 1000).toFixed(0),
      launchDate: new Date().toISOString().split("T")[0],
      status: "active" as const,
      fundingRaised: "0",
      imageUrl: token.imageUrl || DEFAULT_TOKEN_IMAGE,
    })) as ExtendedMemeToken[];
  }, [isWalletConnected, realTokens]);

  const filteredTokens = useMemo(() => {
    let filtered = allTokens.filter(
      (token) =>
        (token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.symbol.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!selectedChain || token.chain === selectedChain.id)
    );

    if (activeFilter === "trending") {
      filtered = [...filtered].sort(
        (a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange)
      );
    } else {
      // For "latest", sort by launch date (newest first)
      filtered = [...filtered].sort((a, b) => {
        // First prioritize tokens from the store (user-created tokens)
        const aIsFromStore = storeTokens.some((t) => t.id === a.id);
        const bIsFromStore = storeTokens.some((t) => t.id === b.id);

        if (aIsFromStore && !bIsFromStore) return -1;
        if (!aIsFromStore && bIsFromStore) return 1;

        // Then sort by launch date if available
        const aDate = a.launchDate ? new Date(a.launchDate) : new Date();
        const bDate = b.launchDate ? new Date(b.launchDate) : new Date();

        return bDate.getTime() - aDate.getTime();
      });
    }

    return filtered;
  }, [searchTerm, activeFilter, selectedChain, allTokens, storeTokens]);

  const totalPages = Math.ceil(filteredTokens.length / itemsPerPage);
  const currentTokens = filteredTokens.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppLayout showFooter={false}>
      <div className="relative z-10">
        <div className="container py-8">
          <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
            <div>
              <h1 className="text-4xl font-bold">
                Meme Token{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                  Marketplace
                </span>
              </h1>
              <p className="mt-2 text-muted-foreground">
                Discover and invest in the latest meme tokens
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tokens..."
                  className="pl-8 w-[200px] md:w-[300px] border border-gray-600 rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-8 sm:flex-row">
            <MarketFilters
              chains={chains}
              filterOptions={filterOptions}
              selectedChain={selectedChain}
              activeFilter={activeFilter}
              onChainSelect={setSelectedChain}
              onFilterSelect={setActiveFilter}
            />
          </div>

          {/* Wallet Warning - show when wallet is not connected */}
          {!isWalletConnected && !isLoading && (
            <div className="mb-8">
              <Alert
                variant="default"
                className="bg-yellow-500/10 border-yellow-500/20"
              >
                <Wallet className="h-5 w-5 text-yellow-500" />
                <AlertTitle>Wallet Not Connected</AlertTitle>
                <AlertDescription>
                  Connect your wallet to see real tokens from the blockchain.
                  Currently showing mock data.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {isLoading ? (
                // Loading state
                Array(8)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="overflow-hidden border bg-black/60 rounded-2xl border-white/10 animate-pulse"
                    >
                      <div className="bg-gray-800 aspect-square"></div>
                      <div className="p-4 space-y-3">
                        <div className="w-2/3 h-5 bg-gray-800 rounded"></div>
                        <div className="w-1/2 h-4 bg-gray-800 rounded"></div>
                        <div className="w-full h-4 bg-gray-800 rounded"></div>
                        <div className="w-full h-10 bg-gray-800 rounded"></div>
                      </div>
                    </div>
                  ))
              ) : currentTokens.length > 0 ? (
                currentTokens.map((token, index) => (
                  <TokenCard key={token.token} token={token} index={index} />
                ))
              ) : (
                <div className="py-12 text-center col-span-full">
                  <h3 className="mb-2 text-xl font-medium">No tokens found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center my-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          handlePageChange(currentPage + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

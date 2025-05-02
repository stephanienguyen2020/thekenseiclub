"use client";

import { CoinList } from "@/app/marketplace/types";
import api from "@/lib/api";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"holdings" | "created">(
    "holdings"
  );
  const [sortBy, setSortBy] = useState("value");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [holdings, setHoldings] = useState<CoinList>();
  const [createdTokens, setCreatedTokens] = useState<CoinList>();
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    if (activeTab === "holdings") {
      const fetchHoldings = async () => {
        const response = await api.get(
          `/holding-coins/${currentAccount?.address}`
        );
        const data = response.data;
        console.log("Holdings data:", data);
        setHoldings(data);
      };
      console.log("currentAccount?.address", currentAccount?.address);
      fetchHoldings();
    }
    if (activeTab === "created") {
      const fetchCreatedTokens = async () => {
        const response = await api.get(`/coins`, {
          params: {
            userId: currentAccount?.address,
          },
        });
        const data = response.data;
        console.log("currentAccount?.address", currentAccount?.address);
        console.log("Created tokens data:", data);
        setCreatedTokens(data);
      };
      fetchCreatedTokens();
    }
  }, [activeTab, currentAccount]);

  // Filter and sort holdings
  const filteredHoldings =
    holdings?.data.filter(
      (holding) =>
        holding.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        holding.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    const aValue = a[sortBy as keyof typeof a];
    const bValue = b[sortBy as keyof typeof b];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  // Filter and sort created tokens
  const filteredCreatedTokens =
    createdTokens?.data.filter(
      (token) =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-white">My Wallet</h1>
        <div className="flex gap-2">
          <button className="bg-[#c0ff00] text-black px-5 py-2 rounded-xl font-bold border-4 border-black">
            Add Asset
          </button>
        </div>
      </div>

      {/* Wallet Overview */}
      <div className="bg-white rounded-3xl p-6 mb-6 border-4 border-black">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-20 h-20 rounded-full bg-[#c0ff00] flex items-center justify-center border-4 border-black">
            <Image
              src="/pixel-cool-cat.png"
              alt="Profile"
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">0x1a2b...3c4d</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="bg-gray-100 px-4 py-2 rounded-xl border-2 border-black">
                <span className="text-gray-500 text-sm">Total Value</span>
                <div className="font-bold">$78,425.03</div>
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-xl border-2 border-black">
                <span className="text-gray-500 text-sm">24h Change</span>
                <div className="font-bold text-green-500">+12.5%</div>
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-xl border-2 border-black">
                <span className="text-gray-500 text-sm">Total Tokens</span>
                <div className="font-bold">10</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="bg-[#0046F4] text-white px-4 py-2 rounded-xl font-bold border-2 border-black">
              Send
            </button>
            <button className="bg-[#0046F4] text-white px-4 py-2 rounded-xl font-bold border-2 border-black">
              Receive
            </button>
            <button className="bg-[#0046F4] text-white px-4 py-2 rounded-xl font-bold border-2 border-black">
              Swap
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-6 py-3 rounded-xl font-bold border-4 ${
            activeTab === "holdings"
              ? "bg-[#c0ff00] text-black border-black"
              : "bg-white text-black border-white"
          }`}
          onClick={() => setActiveTab("holdings")}
        >
          Holdings
        </button>
        <button
          className={`px-6 py-3 rounded-xl font-bold border-4 ${
            activeTab === "created"
              ? "bg-[#c0ff00] text-black border-black"
              : "bg-white text-black border-white"
          }`}
          onClick={() => setActiveTab("created")}
        >
          Created Tokens
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-3xl p-6 mb-6 border-4 border-black">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder={
                activeTab === "holdings"
                  ? "Search holdings..."
                  : "Search tokens..."
              }
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#0039C6]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex border-2 border-black rounded-xl overflow-hidden">
              <button
                className={`p-2 ${
                  viewMode === "table" ? "bg-[#0039C6] text-white" : "bg-white"
                }`}
                onClick={() => setViewMode("table")}
                aria-label="Table view"
              >
                <List size={24} />
              </button>
              <button
                className={`p-2 ${
                  viewMode === "cards" ? "bg-[#0039C6] text-white" : "bg-white"
                }`}
                onClick={() => setViewMode("cards")}
                aria-label="Card view"
              >
                <Grid size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      {activeTab === "holdings" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-black">
          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-4 border-black">
                    <th
                      className="text-left py-4 px-2 cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Asset
                        {sortBy === "name" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="text-right py-4 px-2 cursor-pointer"
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center gap-1 justify-end">
                        Price
                        {sortBy === "price" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="text-right py-4 px-2 cursor-pointer"
                      onClick={() => handleSort("change24h")}
                    >
                      <div className="flex items-center gap-1 justify-end">
                        24h P/L
                        {sortBy === "change24h" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="text-right py-4 px-2 cursor-pointer"
                      onClick={() => handleSort("holdings")}
                    >
                      <div className="flex items-center gap-1 justify-end">
                        Holdings
                        {sortBy === "holdings" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="text-right py-4 px-2 cursor-pointer"
                      onClick={() => handleSort("value")}
                    >
                      <div className="flex items-center gap-1 justify-end">
                        Value
                        {sortBy === "value" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </th>
                    <th className="text-right py-4 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHoldings.map((holding, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <Image
                            src={holding.logo || "/placeholder.svg"}
                            width={40}
                            height={40}
                            alt={holding.name}
                            className="rounded-full border-2 border-black"
                          />
                          <div>
                            <div className="font-medium">{holding.name}</div>
                            <div className="text-sm text-gray-500">
                              {holding.symbol}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-4 px-2 font-medium">
                        ${holding.price.toFixed(8)}
                      </td>
                      <td className="text-right py-4 px-2">
                        <span
                          className={`flex items-center justify-end gap-1 ${
                            holding.change24h >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {holding.change24h >= 0 ? (
                            <ArrowUp size={16} />
                          ) : (
                            <ArrowDown size={16} />
                          )}
                          {Math.abs(holding.change24h)}%
                        </span>
                      </td>
                      <td className="text-right py-4 px-2 font-medium">
                        {holding.holdings?.toLocaleString() || "0"}
                      </td>
                      {/* <td className="text-right py-4 px-2 font-bold">
                        ${holding.value.toLocaleString()}
                      </td> */}
                      <td className="text-right py-4 px-2">
                        <div className="flex gap-2 justify-end">
                          <Link
                            href={`/marketplace/${holding.id}`}
                            className="bg-[#0046F4] text-white px-4 py-1 rounded-xl text-sm font-bold border-2 border-black"
                          >
                            View
                          </Link>
                          <button className="bg-[#c0ff00] text-black px-4 py-1 rounded-xl text-sm font-bold border-2 border-black">
                            AutoShill
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedHoldings.map((holding, index) => (
                <div
                  key={index}
                  className="bg-gray-100 rounded-xl border-4 border-black p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black">
                      <Image
                        src={holding.logo || "/placeholder.svg"}
                        width={48}
                        height={48}
                        alt={holding.name}
                        className="rounded-full object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{holding.name}</h3>
                      <p className="text-gray-500">{holding.symbol}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white p-2 rounded-lg border-2 border-black">
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-medium truncate">
                        ${holding.price.toFixed(8)}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border-2 border-black">
                      <p className="text-xs text-gray-500">24h</p>
                      <p
                        className={`font-medium flex items-center ${
                          holding.change24h >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {holding.change24h >= 0 ? (
                          <ArrowUp size={14} />
                        ) : (
                          <ArrowDown size={14} />
                        )}
                        {Math.abs(holding.change24h)}%
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border-2 border-black">
                      <p className="text-xs text-gray-500">Holdings</p>
                      <p className="font-medium">
                        {holding.holdings?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border-2 border-black">
                      <p className="text-xs text-gray-500">Value</p>
                      <p className="font-medium">
                        {holding.holdings?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto flex gap-2">
                    <Link
                      href={`/marketplace/${holding.id}`}
                      className="flex-1 bg-[#0046F4] text-white py-2 rounded-xl text-sm font-bold border-2 border-black text-center"
                    >
                      View
                    </Link>
                    <button className="flex-1 bg-[#c0ff00] text-black py-2 rounded-xl text-sm font-bold border-2 border-black">
                      AutoShill
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Created Tokens */}
      {activeTab === "created" && (
        <div className="bg-white rounded-3xl p-6 border-4 border-black">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <div className="bg-[#c0ff00] p-3 rounded-xl border-2 border-black">
                <div className="text-black font-bold">Total Tokens</div>
                <div className="text-3xl font-black">
                  {createdTokens?.data.length}
                </div>
              </div>
              <div className="bg-[#0046F4] p-3 rounded-xl border-2 border-black">
                <div className="text-white font-bold">Total Holders</div>
                <div className="text-3xl font-black text-white">3,617</div>
              </div>
              <div className="bg-[#0046F4] p-3 rounded-xl border-2 border-black">
                <div className="text-white font-bold">Total Volume</div>
                <div className="text-3xl font-black text-white">$10,101</div>
              </div>
            </div>
            <Link
              href="/launch"
              className="bg-[#c0ff00] text-black px-5 py-2 rounded-xl font-bold border-4 border-black"
            >
              Create New Token
            </Link>
          </div>

          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-4 border-black">
                    <th className="text-left py-4 px-2">Token</th>
                    <th className="text-right py-4 px-2">Price</th>
                    <th className="text-right py-4 px-2">Market Cap</th>
                    <th className="text-right py-4 px-2">Holders</th>
                    <th className="text-right py-4 px-2">24h Volume</th>
                    <th className="text-center py-4 px-2">Launch Date</th>
                    <th className="text-center py-4 px-2">Status</th>
                    <th className="text-right py-4 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCreatedTokens.map((token, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <Image
                            src={token.logo || "/placeholder.svg"}
                            width={40}
                            height={40}
                            alt={token.name}
                            className="rounded-full border-2 border-black"
                          />
                          <div>
                            <div className="font-medium">{token.name}</div>
                            <div className="text-sm text-gray-500">
                              {token.symbol}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-4 px-2">
                        <div className="font-medium">
                          ${token.price.toFixed(4)}
                        </div>
                        <div className="text-sm text-green-500">
                          +{token.change24h}%
                        </div>
                      </td>
                      <td className="text-right py-4 px-2 font-medium">
                        ${token.marketCap.toLocaleString()}
                      </td>
                      <td className="text-right py-4 px-2 font-medium">
                        {token.holders.toLocaleString()}
                      </td>
                      <td className="text-right py-4 px-2 font-medium">
                        $1,000.00
                      </td>
                      {/* <td className="text-center py-4 px-2">
                        {token.launchDate}
                      </td>
                      <td className="text-center py-4 px-2">
                        <span className="bg-[#c0ff00] text-black px-2 py-1 rounded-full text-xs font-bold">
                          {token.status.charAt(0).toUpperCase() +
                            token.status.slice(1)}
                        </span>
                      </td> */}
                      <td className="text-right py-4 px-2">
                        <div className="flex gap-2 justify-end">
                          <Link
                            href={`/marketplace/${token.id.toLowerCase()}`}
                            className="bg-[#0046F4] text-white px-3 py-1 rounded-xl text-sm font-bold border-2 border-black"
                          >
                            View
                          </Link>
                          <button className="bg-[#c0ff00] text-black px-3 py-1 rounded-xl text-sm font-bold border-2 border-black">
                            AutoShill
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreatedTokens.map((token, index) => (
                <div
                  key={index}
                  className="bg-gray-100 rounded-xl border-4 border-black p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black">
                      <Image
                        src={token.logo || "/placeholder.svg"}
                        width={48}
                        height={48}
                        alt={token.name}
                        className="rounded-full object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{token.name}</h3>
                      <p className="text-gray-500">{token.symbol}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white p-2 rounded-lg border-2 border-black">
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-medium">${token.price.toFixed(4)}</p>
                      <p className="text-xs text-green-500">
                        +{token.change24h}%
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border-2 border-black">
                      <p className="text-xs text-gray-500">Market Cap</p>
                      <p className="font-medium">
                        ${token.marketCap.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border-2 border-black">
                      <p className="text-xs text-gray-500">Holders</p>
                      <p className="font-medium">
                        {token.holders.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border-2 border-black">
                      <p className="text-xs text-gray-500">Launch Date</p>
                      {/* <p className="font-medium">{token.launchDate}</p> */}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/marketplace/${token.id.toLowerCase()}`}
                      className="flex-1 bg-[#0046F4] text-white py-2 rounded-xl text-sm font-bold border-2 border-black text-center"
                    >
                      View
                    </Link>
                    <button className="flex-1 bg-[#c0ff00] text-black py-2 rounded-xl text-sm font-bold border-2 border-black">
                      AutoShill
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

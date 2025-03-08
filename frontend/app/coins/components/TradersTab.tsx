"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { trendingCoins } from "@/app/data/mockCoins";

const generateOrderBook = (basePrice: number, depth: number) => {
  const asks = [];
  const bids = [];

  for (let i = 0; i < depth; i++) {
    const askPrice = basePrice + i * 5 + Math.random() * 2;
    const askAmount = +(Math.random() * 2).toFixed(4);
    asks.push({
      price: askPrice,
      amount: askAmount,
      total: +(askPrice * askAmount).toFixed(2),
      type: "sell",
    });

    const bidPrice = basePrice - i * 5 - Math.random() * 2;
    const bidAmount = +(Math.random() * 2).toFixed(4);
    bids.push({
      price: bidPrice,
      amount: bidAmount,
      total: +(bidPrice * bidAmount).toFixed(2),
      type: "buy",
    });
  }

  return { asks, bids };
};

function OrderBook() {
  const { id } = useParams();
  const [orders, setOrders] = useState(generateOrderBook(45000, 10));
  const [coinSymbol, setCoinSymbol] = useState("BTC");

  useEffect(() => {
    // Get coin symbol from the URL parameter
    if (id) {
      const coinId = Array.isArray(id) ? id[0] : id.toString();
      const coin = trendingCoins.find((c) => c.id === coinId);
      if (coin) {
        setCoinSymbol(coin.symbol);
      }
    }

    const interval = setInterval(() => {
      setOrders(generateOrderBook(45000, 10));
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  return (
    <div className="bg-black/20 rounded-lg p-4 border border-gray-400/30">
      <div className="text-xl font-bold text-gray-100 mb-4">Order Book</div>
      <div className="grid grid-cols-2 gap-4">
        {/* Sell Orders (Red) */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-3 border-b border-gray-800 pb-2 mb-2">
              <div className="text-gray-400 font-medium">Price (USDT)</div>
              <div className="text-gray-400 font-medium text-right">
                Amount ({coinSymbol})
              </div>
              <div className="text-gray-400 font-medium text-right">Total</div>
            </div>
            <div className="space-y-1">
              {orders.asks.map((order, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 hover:bg-gray-800/50 py-1"
                >
                  <div className="font-medium text-red-500">
                    {order.price.toFixed(2)}
                  </div>
                  <div className="text-right text-gray-300">
                    {order.amount.toFixed(4)}
                  </div>
                  <div className="text-right text-gray-300">
                    {order.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buy Orders (Green) */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-3 border-b border-gray-800 pb-2 mb-2">
              <div className="text-gray-400 font-medium">Price (USDT)</div>
              <div className="text-gray-400 font-medium text-right">
                Amount ({coinSymbol})
              </div>
              <div className="text-gray-400 font-medium text-right">Total</div>
            </div>
            <div className="space-y-1">
              {orders.bids.map((order, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 hover:bg-gray-800/50 py-1"
                >
                  <div className="font-medium text-green-500">
                    {order.price.toFixed(2)}
                  </div>
                  <div className="text-right text-gray-300">
                    {order.amount.toFixed(4)}
                  </div>
                  <div className="text-right text-gray-300">
                    {order.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TradersTab = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="border border-gray-400/30">
        <CardContent className="p-4">
          <h4 className="text-sm text-muted-foreground">Total Traders</h4>
          <p className="text-2xl font-bold">16K</p>
        </CardContent>
      </Card>
      <Card className="border border-gray-400/30">
        <CardContent className="p-4">
          <h4 className="text-sm text-muted-foreground">Active (24h)</h4>
          <p className="text-2xl font-bold">3.2K</p>
        </CardContent>
      </Card>
      <Card className="border border-gray-400/30">
        <CardContent className="p-4">
          <h4 className="text-sm text-muted-foreground">Avg Trade</h4>
          <p className="text-2xl font-bold">$187</p>
        </CardContent>
      </Card>
      <Card className="border border-gray-400/30">
        <CardContent className="p-4">
          <h4 className="text-sm text-muted-foreground">Total Trades</h4>
          <p className="text-2xl font-bold">45.6K</p>
        </CardContent>
      </Card>
    </div>

    {/* Order Book */}
    <OrderBook />
  </div>
);

export default TradersTab;

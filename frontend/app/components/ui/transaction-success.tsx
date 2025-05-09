"use client";

import * as React from "react";
import { Check, Copy, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {formatAddress} from "@mysten/sui/utils";

interface TransactionSuccessProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenSymbol: string;
  amount: string;
  recipient?: string;
  transactionHash?: string;
  fee?: string;
  slippage?: string;
  gasUsed?: string;
  estimatedTime?: string;
  onNewTransaction?: () => void;
  autoDismiss?: boolean;
  dismissDuration?: number;
  className?: string;
}

export function TransactionSuccess({
  open,
  onOpenChange,
  tokenSymbol,
  amount,
  recipient = "Your wallet",
  transactionHash = "0xf79DcD66e8bC69dae488c3E0F35e06938102b134",
  fee = "$0.25",
  slippage = "0.5%",
  gasUsed = "0.00123",
  estimatedTime = "0-1 min",
  onNewTransaction,
  autoDismiss = true,
  dismissDuration = 7000,
  className,
}: TransactionSuccessProps) {
  React.useEffect(() => {
    if (open && autoDismiss) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, dismissDuration);
      return () => clearTimeout(timer);
    }
  }, [open, autoDismiss, dismissDuration, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div
        className={cn(
          "w-full max-w-md rounded-xl border-4 border-black bg-blue-600 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
          className
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full border-2 border-black bg-white p-1 text-black hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col items-center">
          {/* Success Icon */}
          <div className="mb-4 h-20 w-20 rounded-full border-4 border-black bg-[#c0ff00] p-1">
            <div className="flex h-full w-full items-center justify-center rounded-full">
              <Check className="h-10 w-10 text-black" strokeWidth={4} />
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-4 text-center text-2xl font-black text-white">
            Transfer has been completed!
          </h2>

          {/* Transaction Summary */}
          <div className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-white p-3 text-lg font-bold">
            <span className="text-black">{amount}</span>
            <span className="text-gray-600">→</span>
            <span className="text-black">{tokenSymbol}</span>
          </div>

          {/* Transaction Details */}
          <div className="mb-6 w-full space-y-4 rounded-xl border-4 border-black bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black">Transaction Hash</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{formatAddress(transactionHash)}</span>
                <button className="rounded-md border-2 border-black p-1 hover:bg-gray-100">
                  <Copy className="h-4 w-4 text-black" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t-2 border-gray-200 pt-2">
              <span className="font-bold text-black">Recipient Address</span>
              <span className="font-medium text-gray-700">{formatAddress(recipient)}</span>
            </div>

            <div className="flex items-center justify-between border-t-2 border-gray-200 pt-2">
              <span className="font-bold text-black">Slippage</span>
              <span className="font-medium text-gray-700">{slippage}</span>
            </div>

            <div className="flex items-center justify-between border-t-2 border-gray-200 pt-2">
              <span className="font-bold text-black">Fee</span>
              <span className="font-medium text-gray-700">{fee}</span>
            </div>

            <div className="flex items-center justify-between border-t-2 border-gray-200 pt-2">
              <span className="font-bold text-black">Gas used</span>
              <span className="font-medium text-gray-700">
                {gasUsed} {tokenSymbol}
              </span>
            </div>

            <div className="flex items-center justify-between border-t-2 border-gray-200 pt-2">
              <span className="font-bold text-black">
                Estimated time for transfer
              </span>
              <span className="font-medium text-gray-700">{estimatedTime}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex w-full gap-4">
            <button
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-4 border-black bg-white py-3 font-bold text-black transition-transform hover:translate-y-[-2px] hover:bg-gray-100 active:translate-y-[1px]"
              onClick={() =>
                window.open(
                  `https://explorer.example.com/tx/${transactionHash}`,
                  "_blank"
                )
              }
            >
              <ExternalLink className="h-5 w-5" />
              View in Explorer
            </button>
            <button
              className="flex-1 rounded-xl border-4 border-black bg-[#c0ff00] py-3 font-bold text-black transition-transform hover:translate-y-[-2px] hover:bg-[#d4ff4d] active:translate-y-[1px]"
              onClick={() => {
                onOpenChange(false);
                onNewTransaction?.();
              }}
            >
              New Swap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

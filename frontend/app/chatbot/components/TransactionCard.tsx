import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Transaction } from "./AIChatbot";
import ReactMarkdown from "react-markdown";

interface TransactionCardProps {
  transaction: Transaction;
  onSubmit: () => Promise<{ hash?: string; error?: string }>;
}

export const TransactionCard = ({
  transaction,
  onSubmit,
}: TransactionCardProps) => {
  const [txStatus, setTxStatus] = useState<
    "pending" | "success" | "error" | null
  >(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const mounted = useRef(false);

  // force reload
  useEffect(() => {});

  useEffect(() => {
    const handleTransaction = async () => {
      if (mounted.current) return;
      mounted.current = true;

      try {
        setTxStatus("pending");
        const { hash, error } = await onSubmit();
        if (hash) {
          setTxHash(hash);
          setTxStatus("success");
        } else if (error) {
          setTxStatus("error");
          toast({
            title: "Transaction Failed",
            description: error,
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Transaction error:", error);
        setTxStatus("error");
        toast({
          title: "Transaction Failed",
          description: error.message || "Transaction was rejected or failed",
          variant: "destructive",
        });
      }
    };

    handleTransaction();
  }, [onSubmit]); // Include onSubmit in dependencies

  if (txStatus === "pending") {
    return (
      <div className="flex items-center gap-2">
        <span>Executing</span>
        <span className="animate-pulse">.</span>
        <span className="animate-pulse animation-delay-200">.</span>
        <span className="animate-pulse animation-delay-400">.</span>
      </div>
    );
  }

  if (txStatus === "success" && txHash) {
    return (
      <div>
        Transaction successful! View on{" "}
        <a
          href={`https://testnet.sonicscan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          SonicScan
        </a>
      </div>
    );
  }

  if (txStatus === "error") {
    return <ReactMarkdown>Transaction failed. Please try again.</ReactMarkdown>;
  }

  // Don't render anything while waiting for wallet popup
  return null;
};

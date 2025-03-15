import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Transaction } from "./AIChatbot";

interface TransactionCardProps {
  transaction: Transaction;
  onSubmit: () => Promise<string>;
}

export const TransactionCard = ({ transaction, onSubmit }: TransactionCardProps) => {
  const [txStatus, setTxStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const handleTransaction = async () => {
      if (mounted.current) return;
      mounted.current = true;
      
      try {
        setTxStatus('pending');
        const hash = await onSubmit();
        setTxHash(hash);
        setTxStatus('success');
      } catch (error: any) {
        console.error('Transaction error:', error);
        setTxStatus('error');
        toast({
          title: "Transaction Failed",
          description: error.message || "Transaction was rejected or failed",
          variant: "destructive",
        });
      }
    };

    handleTransaction();
  }, [onSubmit]); // Include onSubmit in dependencies

  if (txStatus === 'success' && txHash) {
    return (
      <Card className="p-4 w-full max-w-md">
        <div className="mt-4 text-green-500">
          Transaction successful! View on{' '}
          <a 
            href={`https://testnet.sonicscan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            SonicScan
          </a>
        </div>
      </Card>
    );
  }

  if (txStatus === 'error') {
    return (
      <Card className="p-4 w-full max-w-md">
        <div className="mt-4 text-red-500">
          Transaction failed. Please try again.
        </div>
      </Card>
    );
  }

  // Don't render anything while waiting for wallet popup
  return null;
};

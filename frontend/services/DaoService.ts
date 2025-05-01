import { useWalletClient } from "wagmi";
import { usePinataService } from "./PinataService";
import axios from "axios";
import { keccak256, toUtf8Bytes } from "ethers";

interface Proposal {
  title: string;
  description: string;
  options: string[];
  createdBy: string;
  createdAt: Date;
  startDate: string;
  endDate: string;
  ipfsHash: string;
  contentHash: string;
  voteCount: number;
  votePoint: number;
  status: "open" | "closed" | "nominated";
}

interface Vote {
  wallet: string;
  proposalId: string;
  choice: string;
  signature: string;
  timestamp: Date;
}

export const useDaoService = () => {
    const { data: walletClient, isError: walletError } = useWalletClient();
    const { uploadJSONToIPFS } = usePinataService();

    const createProposal = async (proposalData: Omit<Proposal, "ipfsHash" | "contentHash" | "voteCount" | "votePoint" | "status">) => {
        if (!walletClient) throw new Error("Wallet not connected");
        
        // Upload proposal to IPFS
        const ipfsHash = await uploadJSONToIPFS(proposalData);
        
        // Compute content hash
        const contentHash = keccak256(toUtf8Bytes(JSON.stringify(proposalData)));

        // Store metadata in DB
        const response = await axios.post("/api/proposals", {
            ...proposalData,
            ipfsHash,
            contentHash,
            voteCount: 0,
            votePoint: 0,
            status: "open"
        });

        return response.data;
    }

    const getAllProposals = async () => {
        const response = await axios.get("/api/proposals");
        return response.data;
    }

    const getProposal = async (proposalId: string) => {
        const response = await axios.get(`/api/proposals/${proposalId}`);
        return response.data;
    }

    const voteProposal = async (proposalId: string, choice: string) => {
        if (!walletClient) throw new Error("Wallet not connected");
        
        // Create message to sign
        const nonce = Math.floor(Math.random() * 100000);
        const message = `I want to vote for ${choice} on ${new Date().toLocaleDateString()}. Nonce: ${nonce}`;
        
        // Sign message (this will be replaced with Sui wallet later)
        const signature = await walletClient.signMessage({ message });
        
        // Submit vote
        const response = await axios.post("/api/votes", {
            wallet: walletClient.account.address,
            proposalId,
            choice,
            signature,
            timestamp: new Date()
        });

        return response.data;
    }

    return {
        createProposal,
        getAllProposals,
        getProposal,
        voteProposal
    }
}
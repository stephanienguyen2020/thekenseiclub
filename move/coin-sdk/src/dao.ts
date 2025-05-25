import {
    SuiClient,
    SuiObjectChange,
    SuiTransactionBlockResponse,
} from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import {
    Network,
    ACTIVE_NETWORK,
    signAndExecute,
} from "./utils/sui-utils";
import { toBlockchainAmount } from './utils/number-utils';

interface DAOFields {
    next_proposal_id: string;
    min_voting_power: string;
}

interface ProposalFields {
    id: string;
    title: string;
    description: string;
    options: string[];
    created_by: string;
    created_at: string;
    start_time: string;
    end_time: string;
    status: number; // 0 for open, 1 for closed
    winning_option: string | null;
    votes: {
        type: string;
        fields: {
            contents: Array<{
                type: string;
                fields: {
                    key: string;
                    value: string;
                }
            }>;
        };
    };
    vote_points: string[];
    total_votes: string;
    total_points: string;
    token_type: string;
}

interface ProposalInfo {
    id: number;
    title: string;
    description: string;
    options: string[];
    createdBy: string;
    createdAt: Date;
    startTime: Date;
    endTime: Date;
    status: 'open' | 'closed';
    winningOption: string | null;
    votes: {
        [address: string]: number;
    };
    votePoints: number[];
    totalVotes: number;
    totalPoints: number;
    tokenType: string;
}

class DaoSDK {
    private daoId: string;
    private client: SuiClient;
    private packageId: string;

    constructor(daoId: string, client: SuiClient, packageId: string) {
        this.daoId = daoId;
        this.client = client;
        this.packageId = packageId;
    }

    /**
     * Build a transaction to create a new proposal
     */
    buildCreateProposalTransaction({
        title,
        description,
        options,
        tokenType,
        createdAt,
        startDate,
        endDate,
    }: {
        title: string;
        description: string;
        options: string[];
        tokenType: string;
        createdAt?: Date;
        startDate?: Date;
        endDate: Date;
    }): Transaction {
        const tx = new Transaction();

        // Convert strings to UTF-8 byte arrays for Move
        const titleBytes = new TextEncoder().encode(title);
        const descBytes = new TextEncoder().encode(description);
        const tokenTypeBytes = new TextEncoder().encode(tokenType);

        // Convert options to array of Uint8Arrays
        const optionsBytes = options.map(option => 
            new TextEncoder().encode(option)
        );

        // Use current timestamp if createdAt is not provided
        const currentTimeMs = createdAt ? createdAt.getTime() : Date.now();
        
        // Use current timestamp as start date if not provided
        const startTimeMs = startDate ? startDate.getTime() : currentTimeMs;
        
        // End date is required
        const endTimeMs = endDate.getTime();
        
        // Convert milliseconds to seconds for Move contract
        const currentTime = Math.floor(currentTimeMs / 1000);
        const startTime = Math.floor(startTimeMs / 1000);
        const endTime = Math.floor(endTimeMs / 1000);

        tx.moveCall({
            target: `${this.packageId}::dao::create_proposal`,
            arguments: [
                tx.object(this.daoId),
                tx.pure.vector('u8', Array.from(titleBytes)),
                tx.pure.vector('u8', Array.from(descBytes)),
                tx.pure.vector('vector<u8>', optionsBytes.map(bytes => Array.from(bytes))),
                tx.pure.vector('u8', Array.from(tokenTypeBytes)),
                tx.pure.u64(currentTimeMs),
                tx.pure.u64(startTimeMs),
                tx.pure.u64(endTimeMs),
                tx.object("0x6"), // Clock object
            ],
        });

        return tx;
    }

    /**
     * Create a new proposal
     */
    async createProposal({
        title,
        description,
        options,
        tokenType,
        createdAt,
        startDate,
        endDate,
        address,
        gasBudget,
    }: {
        title: string;
        description: string;
        options: string[];
        tokenType: string;
        createdAt?: Date;
        startDate?: Date;
        endDate: Date;
        address: string;
        gasBudget?: number;
    }): Promise<SuiTransactionBlockResponse> {
        const tx = this.buildCreateProposalTransaction({
            title,
            description,
            options,
            tokenType,
            createdAt,
            startDate,
            endDate
        });
        
        // Set a gas budget if provided
        if (gasBudget) {
            tx.setGasBudget(gasBudget);
        }

        return await signAndExecute(tx, ACTIVE_NETWORK, address);
    }

    /**
     * Build a transaction to vote on a proposal
     */
    buildVoteTransaction({
        proposalId,
        optionIndex,
        votingPower,
    }: {
        proposalId: number;
        optionIndex: number;
        votingPower: number; // In human-readable units
    }): Transaction {
        const tx = new Transaction();

        try {
            // Convert to blockchain amount - handle conversion directly to avoid scientific notation issues
            const bnAmount = BigInt(Math.floor(votingPower * 1_000_000_000)); // 9 decimals

            tx.moveCall({
                target: `${this.packageId}::dao::vote`,
                arguments: [
                    tx.object(this.daoId),
                    tx.pure.u64(proposalId),
                    tx.pure.u64(optionIndex),
                    tx.pure.u64(bnAmount),
                ],
            });

            return tx;
        } catch (error) {
            console.error("Error in buildVoteTransaction:", error);
            throw error;
        }
    }

    /**
     * Vote on a proposal
     */
    async vote({
        proposalId,
        optionIndex,
        votingPower,
        address,
    }: {
        proposalId: number;
        optionIndex: number;
        votingPower: number; // In human-readable units
        address: string;
    }): Promise<SuiTransactionBlockResponse> {
        const tx = this.buildVoteTransaction({
            proposalId,
            optionIndex,
            votingPower
        });

        return await signAndExecute(tx, ACTIVE_NETWORK, address);
    }

    /**
     * Build a transaction to close a proposal that has reached its end time
     */
    buildCloseProposalTransaction({
        proposalId,
        voterBalances = [],
    }: {
        proposalId: number;
        voterBalances?: { address: string; balance: number }[];
    }): Transaction {
        const tx = new Transaction();
        
        // Prepare voter addresses and balances for transaction
        const addresses: string[] = [];
        const balances: bigint[] = [];
        
        for (const voterBalance of voterBalances) {
            addresses.push(voterBalance.address);
            // Convert to blockchain amount (9 decimals)
            balances.push(BigInt(Math.floor(voterBalance.balance * 1_000_000_000)));
        }

        tx.moveCall({
            target: `${this.packageId}::dao::close_proposal`,
            arguments: [
                tx.object(this.daoId),
                tx.pure.u64(proposalId),
                tx.pure.vector('address', addresses),
                tx.pure.vector('u64', balances),
                tx.object("0x6"), // Clock object
            ],
        });

        return tx;
    }

    /**
     * Close a proposal that has reached its end time and calculate token-weighted votes
     */
    async closeProposal({
        proposalId,
        voterBalances = [],
        address,
    }: {
        proposalId: number;
        voterBalances?: { address: string; balance: number }[];
        address: string;
    }): Promise<SuiTransactionBlockResponse> {
        const tx = this.buildCloseProposalTransaction({
            proposalId,
            voterBalances
        });

        return await signAndExecute(tx, ACTIVE_NETWORK, address);
    }

    /**
     * Get DAO information
     */
    async getDAOInfo(): Promise<{ nextProposalId: number; minVotingPower: number }> {
        const daoObj = await this.client.getObject({
            id: this.daoId,
            options: {
                showContent: true,
            },
        });

        if (!daoObj.data?.content) {
            throw new Error("Failed to retrieve DAO data");
        }

        const fields = (daoObj.data.content as any).fields as DAOFields;

        return {
            nextProposalId: parseInt(fields.next_proposal_id),
            minVotingPower: parseInt(fields.min_voting_power) / 1e9, // Convert to human-readable units
        };
    }

    /**
     * Get proposal information by ID
     */
    async getProposal(proposalId: number): Promise<ProposalInfo | null> {
        try {
            console.log("Getting proposal for ID:", proposalId);
            // First get the DAO object to access its table
            const daoObj = await this.client.getObject({
                id: this.daoId,
                options: {
                    showContent: true,
                },
            });

            console.log("DAO object:", JSON.stringify(daoObj, null, 2));

            if (!daoObj.data?.content) {
                throw new Error("Failed to retrieve DAO data");
            }

            const tableId = (daoObj.data.content as any).fields.proposals.fields.id.id;

            // Use Dynamic Field API to access the table entry
            const dynamicFieldResult = await this.client.getDynamicFieldObject({
                parentId: tableId,
                name: {
                    type: "u64",
                    value: proposalId.toString(),
                },
            });

            console.log("Dynamic field result:", JSON.stringify(dynamicFieldResult, null, 2));

            if (!dynamicFieldResult.data?.content) {
                return null; // Proposal not found
            }

            const proposalFields = (dynamicFieldResult.data.content as any).fields.value.fields as ProposalFields;
            
            console.log("Raw proposal fields:", JSON.stringify(proposalFields, null, 2));
            console.log("Status value:", proposalFields.status, "Type:", typeof proposalFields.status);

            // Convert votes map to object
            const votes: { [address: string]: number } = {};
            if (proposalFields.votes?.fields?.contents) {
                const contents = proposalFields.votes.fields.contents;
                if (Array.isArray(contents)) {
                    for (let i = 0; i < contents.length; i++) {
                        const entry = contents[i];
                        if (entry && entry.fields) {
                            votes[entry.fields.key] = parseInt(entry.fields.value);
                        }
                    }
                }
            }

            // Convert winning option
            let winningOption: string | null = null;
            if (proposalFields.winning_option) {
                winningOption = proposalFields.winning_option;
            }

            // Handle potential missing start_time field for backward compatibility
            const startTime = proposalFields.start_time 
                ? new Date(parseInt(proposalFields.start_time))
                : new Date(parseInt(proposalFields.created_at)); // Fallback to created_at

            // Ensure vote_points is an array
            const votePoints = Array.isArray(proposalFields.vote_points) 
                ? proposalFields.vote_points.map(p => parseInt(p))
                : [];

            return {
                id: parseInt(proposalFields.id),
                title: proposalFields.title,
                description: proposalFields.description,
                options: Array.isArray(proposalFields.options) ? proposalFields.options : [],
                createdBy: proposalFields.created_by,
                createdAt: new Date(parseInt(proposalFields.created_at)),
                startTime,
                endTime: new Date(parseInt(proposalFields.end_time)),
                status: proposalFields.status === 0 ? "open" : "closed",
                winningOption,
                votes,
                votePoints,
                totalVotes: parseInt(proposalFields.total_votes),
                totalPoints: parseInt(proposalFields.total_points),
                tokenType: proposalFields.token_type || "",
            };
        } catch (error) {
            console.error("Error getting proposal:", error);
            throw error;
        }
    }

    /**
     * Get all proposals
     */
    async getAllProposals(): Promise<ProposalInfo[]> {
        const daoInfo = await this.getDAOInfo();
        const proposals: ProposalInfo[] = [];

        for (let i = 0; i < daoInfo.nextProposalId; i++) {
            try {
                const proposal = await this.getProposal(i);
                if (proposal) {
                    proposals.push(proposal);
                }
            } catch (error) {
                console.error(`Error fetching proposal ${i}:`, error);
            }
        }

        return proposals;
    }

    /**
     * Check if a user has voted on a proposal
     */
    async hasVoted(proposalId: number, address: string): Promise<boolean> {
        const proposal = await this.getProposal(proposalId);
        if (!proposal) return false;

        return !!proposal.votes[address];
    }

    /**
     * Get active proposals (status = open)
     */
    async getActiveProposals(): Promise<ProposalInfo[]> {
        const allProposals = await this.getAllProposals();
        return allProposals.filter(p => p.status === 'open');
    }

    /**
     * Get closed proposals (status = closed)
     */
    async getClosedProposals(): Promise<ProposalInfo[]> {
        const allProposals = await this.getAllProposals();
        return allProposals.filter(p => p.status === 'closed');
    }

    /**
     * Check if there are any proposals that have reached their end time but are still open
     * and should be closed
     */
    async getExpiredOpenProposals(): Promise<ProposalInfo[]> {
        const activeProposals = await this.getActiveProposals();
        const now = new Date();
        return activeProposals.filter(p => p.endTime.getTime() < now.getTime());
    }
}

export { DaoSDK }; 
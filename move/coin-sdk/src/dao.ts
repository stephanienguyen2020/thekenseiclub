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
    end_time: string;
    status: string; // "0" for open, "1" for closed
    winning_option: { vec: string[] } | null;
    votes: { keys: string[], values: string[] };
    vote_points: string[];
    total_votes: string;
    total_points: string;
}

interface ProposalInfo {
    id: number;
    title: string;
    description: string;
    options: string[];
    createdBy: string;
    createdAt: Date;
    endTime: Date;
    status: 'open' | 'closed';
    winningOption: string | null;
    votes: {
        [address: string]: number;
    };
    votePoints: number[];
    totalVotes: number;
    totalPoints: number;
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
     * Create a new proposal
     */
    async createProposal({
        title,
        description,
        options,
        durationDays,
        address,
    }: {
        title: string;
        description: string;
        options: string[];
        durationDays: number;
        address: string;
    }): Promise<SuiTransactionBlockResponse> {
        const tx = new Transaction();

        // Convert strings to UTF-8 byte arrays for Move
        const titleBytes = new TextEncoder().encode(title);
        const descBytes = new TextEncoder().encode(description);

        // Convert options to array of Uint8Arrays
        const optionsBytes = options.map(option =>
            new TextEncoder().encode(option)
        );

        tx.moveCall({
            target: `${this.packageId}::dao::create_proposal`,
            arguments: [
                tx.object(this.daoId),
                tx.pure.vector('u8', Array.from(titleBytes)),
                tx.pure.vector('u8', Array.from(descBytes)),
                tx.pure.vector('vector<u8>', optionsBytes.map(bytes => Array.from(bytes))),
                tx.pure.u64(durationDays),
                tx.object("0x6"), // Clock object
            ],
        });

        return await signAndExecute(tx, ACTIVE_NETWORK, address);
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
        const tx = new Transaction();

        try {
            // Convert to blockchain amount - handle conversion directly to avoid scientific notation issues
            // Compute the amount with decimals but avoid scientific notation when converting to string
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

            return await signAndExecute(tx, ACTIVE_NETWORK, address);
        } catch (error) {
            console.error("Error in vote function:", error);
            throw error;
        }
    }

    /**
     * Close a proposal that has reached its end time
     */
    async closeProposal({
        proposalId,
        address,
    }: {
        proposalId: number;
        address: string;
    }): Promise<SuiTransactionBlockResponse> {
        const tx = new Transaction();

        tx.moveCall({
            target: `${this.packageId}::dao::close_proposal`,
            arguments: [
                tx.object(this.daoId),
                tx.pure.u64(proposalId),
                tx.object("0x6"), // Clock object
            ],
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

            // Convert votes map to object
            const votes: { [address: string]: number } = {};
            if (proposalFields.votes.keys?.length > 0) {
                for (let i = 0; i < proposalFields.votes.keys.length; i++) {
                    votes[proposalFields.votes.keys[i]] = parseInt(proposalFields.votes.values[i]);
                }
            }

            // Convert winning option
            let winningOption: string | null = null;
            if (proposalFields.winning_option && proposalFields.winning_option.vec.length > 0) {
                winningOption = proposalFields.winning_option.vec[0];
            }

            return {
                id: parseInt(proposalFields.id),
                title: proposalFields.title,
                description: proposalFields.description,
                options: proposalFields.options,
                createdBy: proposalFields.created_by,
                createdAt: new Date(parseInt(proposalFields.created_at)),
                endTime: new Date(parseInt(proposalFields.end_time)),
                status: proposalFields.status === "0" ? "open" : "closed",
                winningOption,
                votes,
                votePoints: proposalFields.vote_points.map(p => parseInt(p)),
                totalVotes: parseInt(proposalFields.total_votes),
                totalPoints: parseInt(proposalFields.total_points),
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
        return allProposals;
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
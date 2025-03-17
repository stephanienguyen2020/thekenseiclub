import {
    elizaLogger,
    Action,
    HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    composeContext,
    generateObject,
    ModelClass,
    Content,
} from "@elizaos/core";
import { z } from "zod";

export const swapTemplate = `You are an AI assistant specialized in processing cryptocurrency swap requests. Your task is to extract specific information from user messages and format it into a structured JSON response.

First, review the recent messages from the conversation:

<recent_messages>
{{recentMessages}}
</recent_messages>

Your goal is to extract the following information about the requested token swap:
1. Source token (either "sonic" or a contract address)
2. Source token amount
3. Destination token (either "sonic" or a contract address)

Before providing the final JSON output, show your reasoning process inside <analysis> tags. Follow these steps:

1. Identify the relevant information from the user's message:
   - Quote the part mentioning the source token (either "sonic" or contract address)
   - Quote the part mentioning the source token amount
   - Quote the part mentioning the destination token (either "sonic" or contract address)

2. Validate each piece of information:
   - Source Token: Check if it's either "sonic" or a valid contract address starting with "0x" or "sei1"
   - Source Amount: Attempt to convert the amount to a number to verify it's valid
   - Destination Token: Check if it's either "sonic" or a valid contract address starting with "0x" or "sei1"
   - If contract address is provided, verify it contains 42 characters
   - Chain: Verify the chain is either mainnet, testnet, or devnet

3. If any information is missing or invalid, prepare an appropriate error message.

4. If all information is valid, summarize your findings.

5. Prepare the JSON structure based on your analysis.

After your analysis, provide the final output in a JSON markdown block. All fields are required. The JSON should have this structure:
\`\`\`json
{
    "source_token": string,  // Either "sonic" or contract address
    "source_amount": string,
    "destination_token": string  // Either "sonic" or contract address
}
\`\`\`

Remember:
- The amounts should be strings representing quantities without any currency symbols
- If not "sonic", the token must be a valid contract address starting with "0x"
- One side of the swap must always be "sonic"

Now, process the user's request and provide your response.
`;

export const swapAction: Action = {
    name: "SWAP_TOKENS",
    description:
        "Help users purchase tokens by processing their request to buy a specific amount of a given token contract address",
    similes: ["SWAP_SONIC", "SWAP", "PURCHASE_SONIC"],
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: { [key: string]: unknown },
        _callback: HandlerCallback
    ): Promise<boolean> => {
        elizaLogger.debug("Swap action handler called");
        // Create a new variable to avoid reassigning the parameter
        let updatedState = _state;

        if (!updatedState) {
            updatedState = (await _runtime.composeState(_message)) as State;
        } else {
            updatedState = await _runtime.updateRecentMessageState(
                updatedState
            );
        }
        // get the context aka token address and amount
        const context = composeContext({
            state: updatedState,
            template: swapTemplate,
        });

        const schema = z.object({
            source_token: z.string(),
            source_amount: z.string(),
            destination_token: z.string(),
        });

        const swapDetailObject = await generateObject({
            runtime: _runtime,
            context,
            modelClass: ModelClass.SMALL,
            schema,
        });
        const swapDetail = swapDetailObject.object as {
            source_token: string;
            source_amount: string;
            destination_token: string;
        };

        elizaLogger.debug("Swap detail:", swapDetail);

        if (
            swapDetail.source_amount &&
            swapDetail.source_token &&
            swapDetail.destination_token
        ) {
            let body = {};
            if (swapDetail.destination_token === "sonic") {
                body = {
                    amount: swapDetail.source_amount,
                    tokenAddress: swapDetail.source_token,
                    swapType: "TOKEN_TO_SONIC",
                };
            }
            if (swapDetail.source_token === "sonic") {
                body = {
                    amount: swapDetail.source_amount,
                    tokenAddress: swapDetail.destination_token,
                    swapType: "SONIC_TO_TOKEN",
                };
            }
            elizaLogger.debug("Body:", body);
            // if body is empty, return error
            if (Object.keys(body).length === 0) {
                _callback({
                    text: "Invalid swap request. Please try again.",
                    user: "Sage",
                });
                return false;
            }
            const response = await fetch(
                "http://localhost:3000/api/memecoin/swap-for-user",
                {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                elizaLogger.error(
                    "Failed to swap tokens:",
                    response.statusText
                );
                _callback({
                    text: "Failed to swap tokens. Please try again later.",
                    user: "Sage",
                });
                return false;
            }

            const transactionData = await response.json();
            elizaLogger.debug("Transaction data:", transactionData);

            transactionData.transactionType = "swap";

            if (transactionData.success) {
                _callback({
                    text: `Swapping ${swapDetail.source_amount} ${swapDetail.source_token} for ${swapDetail.destination_token}`,
                    action: "SWAP_TOKENS_RESPONSE",
                    source: _message.content?.source,
                    transaction: transactionData.transaction, // Attach JSON data
                    user: "Sage",
                });
                return true;
            } else {
                _callback({
                    text: transactionData.error,
                    user: "Sage",
                });
                return false;
            }
        } else {
            _callback({
                text: `I'm sorry, I couldn't find the amount or token address in the message. Please try again.`,
                content: {
                    text: `I'm sorry, I couldn't find the amount or token address in the message. Please try again.`,
                    user: "Sage",
                },
            });
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Swap 1 sonic for XYZ Token at address 0x1234567890123456789012345678901234567890",
                    action: "SWAP_TOKENS",
                },
            },
            {
                user: "Sage",
                content: {
                    text: "Swap 1000 XYZ Token at address 0x1234567890123456789012345678901234567890 for sonic",
                    action: "SWAP_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Swap 1 sonic for ETH at address 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                    action: "SWAP_TOKENS",
                },
            },
            {
                user: "Sage",
                content: {
                    text: "Swap 500 ETH at address 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 for sonic",
                    action: "SWAP_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Swap 1 sonic for Token at address 0x1234567890123456789012345678901234567890",
                    action: "SWAP_TOKENS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Swap 10000 Token at address 0x1234567890123456789012345678901234567890 for sonic",
                    action: "SWAP_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Swap 1 sonic for PEPE at address 0x6982508145454ce325ddbe47a25d4ec3d2311933",
                    action: "SWAP_TOKENS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Swap 5000 PEPE at address 0x6982508145454ce325ddbe47a25d4ec3d2311933 for sonic",
                    action: "SWAP_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Swap 1 sonic for DOGE at address 0x3832d2F059E55934220881F831bE501D180671A7",
                    action: "SWAP_TOKENS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Swap 1000 DOGE at address 0x3832d2F059E55934220881F831bE501D180671A7 for sonic",
                    action: "SWAP_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Swap 1 sonic for SHIB at address 0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
                    action: "SWAP_TOKENS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Swap 2500 SHIB at address 0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE for sonic",
                    action: "SWAP_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Swap 1 sonic for FLOKI at address 0x43f11c02439e2736800433b4594994Bd43Cd066D",
                    action: "SWAP_TOKENS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Swap 750 FLOKI at address 0x43f11c02439e2736800433b4594994Bd43Cd066D for sonic",
                    action: "SWAP_TOKENS",
                },
            },
        ],
    ],
};

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
} from "@elizaos/core";
import { z } from "zod";

export const buyTemplate = `You are an AI assistant specialized in processing cryptocurrency transfer requests. Your task is to extract specific information from user messages and format it into a structured JSON response.

First, review the recent messages from the conversation:

<recent_messages>
{{recentMessages}}
</recent_messages>

Your goal is to extract the following information about the requested token purchase:
1. Token contract address
2. Amount to purchase

Before providing the final JSON output, show your reasoning process inside <analysis> tags. Follow these steps:

1. Identify the relevant information from the user's message:
   - Quote the part mentioning the token amount to purchase
   - Quote the part mentioning the token contract address

2. Validate each piece of information:
   - Amount: Attempt to convert the amount to a number to verify it's valid
   - Token Address: Check that it starts with either "0x" or "sei1" and contains 42 characters
   - Chain: Verify the chain is either mainnet, testnet, or devnet

3. If any information is missing or invalid, prepare an appropriate error message.

4. If all information is valid, summarize your findings.

5. Prepare the JSON structure based on your analysis.

After your analysis, provide the final output in a JSON markdown block. All fields are required. The JSON should have this structure:
\`\`\`json
{
    "amount": string,
    "tokenAddress": string
}
\`\`\`

Remember:
- The amount should be a string representing the quantity to purchase without any currency symbols
- The token address must be a valid contract address starting with "0x" or "sei1" and be 42 characters long

Now, process the user's request and provide your response.
`;

export const buyAction: Action = {
    name: "BUY_TOKENS",
    description:
        "Help users purchase tokens by processing their request to buy a specific amount of a given token contract address",
    similes: [
        "BUY_TOKENS",
        "PURCHASE_TOKENS",
        "GET_TOKENS",
        "BUY",
        "PURCHASE",
        "GET",
    ],
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
        elizaLogger.debug("Buy action handler called");
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
            template: buyTemplate,
        });

        const schema = z.object({
            amount: z.string(),
            tokenAddress: z.string(),
        });

        const buyDetailObject = await generateObject({
            runtime: _runtime,
            context,
            modelClass: ModelClass.SMALL,
            schema,
        });
        const buyDetail = buyDetailObject.object as {
            amount: string;
            tokenAddress: string;
        };

        elizaLogger.debug("Buy detail:", buyDetail);

        if (buyDetail.amount && buyDetail.tokenAddress) {
            const response = await fetch(
                "http://localhost:3000/api/memecoin/buy-for-user",
                {
                    method: "POST",
                    body: JSON.stringify({
                        amount: buyDetail.amount,
                        tokenAddress: buyDetail.tokenAddress,
                    }),
                }
            );

            const transactionData = await response.json();
            elizaLogger.debug("Transaction data:", transactionData);

            transactionData.transactionType = "buy";

            if (transactionData.success) {
                _callback({
                    text: `Buying ${buyDetail.amount} ${buyDetail.tokenAddress}`,
                    content: {
                        text: `Buying ${buyDetail.amount} ${buyDetail.tokenAddress}`,
                        transaction: transactionData.transaction,
                        user: "Sage",
                    },
                });
                return true;
            } else {
                _callback({
                    text: transactionData.error,
                    content: {
                        text: transactionData.error,
                        user: "Sage",
                    },
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
                    text: "help me buy 1000 SONIC token with address: 0x1234567890123456789012345678901234567890",
                    action: "BUY_TOKENS",
                },
            },
            {
                user: "Sage",
                content: {
                    text: "executing buy order for 1000 SONIC tokens at 0x1234567890123456789012345678901234567890. transaction confirmed. always verify contracts before trading and consider #Sonic #SonicLabs for optimal security.",
                    action: "BUY_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "execute buy 500 ETH with address: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                },
            },
            {
                user: "Sage",
                content: {
                    text: "buying 500 ETH at 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2. transaction complete. remember to secure your assets and check out #Sonic #SonicLabs for advanced portfolio management.",
                    action: "BUY_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "help me buy 10000 token with address: 0x1234567890123456789012345678901234567890",
                    action: "BUY_TOKENS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you buy 10000 token with address: 0x1234567890123456789012345678901234567890",
                    action: "BUY_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "help me buy 5000 PEPE token with address: 0x6982508145454ce325ddbe47a25d4ec3d2311933",
                    action: "BUY_TOKENS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you buy 5000 PEPE token with address: 0x6982508145454ce325ddbe47a25d4ec3d2311933",
                    action: "BUY_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "init buy 1000 DOGE token with address: 0x3832d2F059E55934220881F831bE501D180671A7",
                    action: "BUY_TOKENS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you buy 1000 DOGE token with address: 0x3832d2F059E55934220881F831bE501D180671A7",
                    action: "BUY_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "execute buy 2500 SHIB token with address: 0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
                    action: "BUY_TOKENS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you buy 2500 SHIB token with address: 0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
                    action: "BUY_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "initiate purchase of 750 FLOKI token with address: 0x43f11c02439e2736800433b4594994Bd43Cd066D",
                    action: "BUY_TOKENS",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you buy 750 FLOKI token with address: 0x43f11c02439e2736800433b4594994Bd43Cd066D",
                    action: "BUY_TOKENS",
                },
            },
        ],
    ],
};

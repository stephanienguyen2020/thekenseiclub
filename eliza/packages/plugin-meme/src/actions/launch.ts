import {
    ActionExample,
    Content,
    elizaLogger,
    generateText,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    type Action,
} from "@elizaos/core";

export const launchTokenAction: Action = {
    name: "LAUNCH_TOKEN",
    similes: ["MAKE_TOKENS", "CREATE_TOKEN"],
    description: "Create a token with the given details if asked by the user.",
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: { [key: string]: unknown },
        _callback: HandlerCallback
    ): Promise<boolean> => {
        elizaLogger.log("Msg content:", _message);
        const context = `Extract the token concept and key features from this message: "${_message.content.text}".
        
        For example:
        - "Let's make an eco-friendly token with carbon credits" -> "eco-friendly token with carbon credits"
        - "Can we create a token for decentralized storage?" -> "decentralized storage token"
        - "Help me launch a token for decentralized VPN services" -> "decentralized VPN services token"
        - "Let's create a token for educational content rewards" -> "educational content rewards token"

        Return just the token description with no additional text, punctuation, or explanation.`;

        let description = await generateText({
            runtime: _runtime,
            context,
            modelClass: ModelClass.SMALL,
            stop: ["\n"],
        });

        elizaLogger.log("Description:", description);

        try {
            const res = await fetch(
                "http://localhost:3000/api/memecoin/create-for-user-tag",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        isTwitter: false,
                        userWalletAddress: _message.content.userWalletId,
                        input: description,
                    }),
                }
            );
            if (!res.ok) {
                elizaLogger.error("Failed to launch token:", res.statusText);
                return false;
            }

            const tokenResponse = await res.json();
            if (tokenResponse.success) {
                elizaLogger.log("Token response:", tokenResponse);
                _callback({
                    text: `Launching token with description: ${description}`,
                    action: "LAUNCH_TOKEN_RESPONSE",
                    source: _message.content?.source,
                    user: "Sage",
                    transaction: tokenResponse.transaction,
                });
                return true;
            } else {
                elizaLogger.error(
                    "Failed to launch token:",
                    tokenResponse.error
                );
                _callback({
                    text: tokenResponse.error,
                    user: "Sage",
                });
                return false;
            }
        } catch (error) {
            elizaLogger.error("Failed to launch token:", error);
            _callback({
                text: "Failed to launch token. Please try again later.",
                user: "Sage",
            });
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Let's create an AI-powered meme token with community governance",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you create a token with AI and community governance features.",
                    action: "LAUNCH_TOKEN",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to launch a cat-themed token that donates to shelters",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you create a charitable cat-themed token.",
                    action: "LAUNCH_TOKEN",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can we make a gaming token with in-game utility and rewards?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you design a gaming token with rewards system.",
                    action: "LAUNCH_TOKEN",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Help me create a Web3 social token for content creators",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll assist you in creating a social token for content creators.",
                    action: "LAUNCH_TOKEN",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to launch a DeFi token with yield farming features",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you create a DeFi token with yield farming.",
                    action: "LAUNCH_TOKEN",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Let's make a dog-themed token with community rewards",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you create a dog-themed token with community features.",
                    action: "LAUNCH_TOKEN",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can we create an NFT token with staking mechanics?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you design an NFT token with staking features.",
                    action: "LAUNCH_TOKEN",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Help me launch a metaverse token with virtual land features",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll assist you in creating a metaverse token with land features.",
                    action: "LAUNCH_TOKEN",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to create a music NFT token for artists",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you create a music NFT token for artists.",
                    action: "LAUNCH_TOKEN",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Let's make an eco-friendly token with carbon credits",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you create an eco-friendly token with carbon credits.",
                    action: "LAUNCH_TOKEN",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can we create a token for decentralized storage?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you design a token for decentralized storage.",
                    action: "LAUNCH_TOKEN",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Help me launch a token for decentralized VPN services",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll assist you in creating a token for VPN services.",
                    action: "LAUNCH_TOKEN",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "Let's create a token for educational content rewards",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll help you create an educational rewards token.",
                    action: "LAUNCH_TOKEN",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;

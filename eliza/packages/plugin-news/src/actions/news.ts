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

export const currentNewsAction: Action = {
    name: "CURRENT_NEWS",
    similes: ["NEWS", "GET_NEWS", "GET_CURRENT_NEWS"],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        const apiKey = process.env.NEWS_API_KEY;
        if (!apiKey) {
            throw new Error("NEWS_API_KEY environment variable is not set");
        }
        return true;
    },
    description:
        "Get the latest news about a specific topic if asked by the user.",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: { [key: string]: unknown },
        _callback: HandlerCallback
    ): Promise<boolean> => {
        async function getCurrentNews(searchTerm: string) {
            try {
                const enhancedSearchTerm = searchTerm.split(" ").join("+");

                const [everythingResponse, headlinesResponse] =
                    await Promise.all([
                        fetch(
                            `https://newsapi.org/v2/everything?q=${enhancedSearchTerm}&sortBy=relevancy&language=en&pageSize=50&apiKey=${process.env.NEWS_API_KEY}`
                        ),
                        fetch(
                            `https://newsapi.org/v2/top-headlines?q=${enhancedSearchTerm}}&country=es&language=en&pageSize=50&apiKey=${process.env.NEWS_API_KEY}`
                        ),
                    ]);

                const [everythingData, headlinesData] = await Promise.all([
                    everythingResponse.json(),
                    headlinesResponse.json(),
                ]);

                // Combine and filter articles
                const allArticles = [
                    ...(headlinesData.articles || []),
                    ...(everythingData.articles || []),
                ].filter(
                    (article) =>
                        article.title &&
                        article.description &&
                        (article.title
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                            article.description
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()))
                );

                // Remove duplicates and get up to 15 articles
                const uniqueArticles = Array.from(
                    new Map(
                        allArticles.map((article) => [article.title, article])
                    ).values()
                ).slice(0, 6);

                if (!uniqueArticles.length) {
                    return "No news articles found.";
                }

                return uniqueArticles;
            } catch (error) {
                console.error("Failed to fetch news:", error);
                return "Sorry, there was an error fetching the news.";
            }
        }

        const context = `Extract ONLY the main topic or subject the user wants news about from this message: "${_message.content.text}". 
For example:
- "what's the latest news about artificial intelligence?" -> "artificial intelligence"
- "can you show me the latest news about climate change?" -> "climate change"
- "what's in the cryptocurrency news today?" -> "cryptocurrency"
- "tell me everything about cybersecurity in the news" -> "cybersecurity"

Return just the topic with no additional text, punctuation, or explanation.`;

        const searchTerm = await generateText({
            runtime: _runtime,
            context,
            modelClass: ModelClass.SMALL,
            stop: ["\n"],
        });

        // For debugging
        console.log("Search term extracted:", searchTerm);
        let currentNews = "";
        const UniqueNews = await getCurrentNews(searchTerm);

        if (typeof UniqueNews === "string") {
            currentNews = UniqueNews;
        } else {
            currentNews = UniqueNews.map((article, index) => {
                const content = article.description || "No content available";
                const urlDomain = article.url
                    ? new URL(article.url).hostname
                    : "";
                return [
                    `📰 Article ${index + 1}`,
                    "━━━━━━━━━━━━━━━━━━━━━━",
                    `📌 **${article.title || "No title"}**\n`,
                    `📝 ${content}\n`,
                    `🔗 Read more at: ${urlDomain}`,
                ].join("\n");
            }).join("\n");
        }

        // Create JSON data object
        const jsonData = {
            searchTerm,
            articles: UniqueNews,
        };

        const newMemory: Memory = {
            userId: _message.agentId,
            agentId: _message.agentId,
            roomId: _message.roomId,
            content: {
                text: currentNews,
                action: "CURRENT_NEWS_RESPONSE",
                source: _message.content?.source,
                data: jsonData, // Attach JSON data
            } as Content,
        };

        await _runtime.messageManager.createMemory(newMemory);

        _callback(newMemory.content);
        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "what's the latest news about artificial intelligence?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Let me check the latest news about artificial intelligence.",
                    action: "CURRENT_NEWS",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "can you show me the latest news about climate change?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll find the latest news about climate change for you.",
                    action: "CURRENT_NEWS",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: { text: "what's in the cryptocurrency news today?" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Let me check today's cryptocurrency news.",
                    action: "CURRENT_NEWS",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "show me current events about renewable energy?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll get you the current events about renewable energy.",
                    action: "CURRENT_NEWS",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "what's going on in the world of electric vehicles?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Let me find out what's happening in the electric vehicles industry.",
                    action: "CURRENT_NEWS",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "give me the latest headlines about space exploration?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll fetch the latest headlines about space exploration.",
                    action: "CURRENT_NEWS",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "show me news updates about quantum computing?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll show you the latest updates about quantum computing.",
                    action: "CURRENT_NEWS",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "what are today's top stories about machine learning?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Let me find today's top stories about machine learning.",
                    action: "CURRENT_NEWS",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "I need information about what's happening with robotics",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll gather the latest information about robotics.",
                    action: "CURRENT_NEWS",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "tell me everything about cybersecurity in the news",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll find all the recent news about cybersecurity.",
                    action: "CURRENT_NEWS",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "have you heard anything new about blockchain?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Let me check the latest news about blockchain.",
                    action: "CURRENT_NEWS",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "any breaking news regarding autonomous vehicles?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll look for breaking news about autonomous vehicles.",
                    action: "CURRENT_NEWS",
                },
            },
        ],

        [
            {
                user: "{{user1}}",
                content: {
                    text: "what is the current news about renewable energy?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll check the current news about renewable energy.",
                    action: "CURRENT_NEWS",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;

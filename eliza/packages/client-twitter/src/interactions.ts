import { SearchMode, type Tweet } from "agent-twitter-client";
import {
    composeContext,
    generateMessageResponse,
    generateShouldRespond,
    messageCompletionFooter,
    shouldRespondFooter,
    type Content,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    ModelClass,
    type State,
    stringToUuid,
    elizaLogger,
    getEmbeddingZeroVector,
    type IImageDescriptionService,
    ServiceType,
} from "@elizaos/core";
import type { ClientBase } from "./base.ts";
import { buildConversationThread, sendTweet, wait } from "./utils.ts";

export const twitterMessageHandlerTemplate =
    `
# Areas of Expertise
{{knowledge}}

# About {{agentName}} (@{{twitterUserName}}):
{{bio}}
{{lore}}
{{topics}}

{{providers}}

{{characterPostExamples}}

{{postDirections}}

Recent interactions between {{agentName}} and other users:
{{recentPostInteractions}}

{{recentPosts}}

# TASK: Generate a post/reply in the voice, style and perspective of {{agentName}} (@{{twitterUserName}}) while using the thread of tweets as additional context:

Current Post:
{{currentPost}}
Here is the descriptions of images in the Current post.
{{imageDescriptions}}

Thread of Tweets You Are Replying To:
{{formattedConversation}}

# INSTRUCTIONS: Generate a post in the voice, style and perspective of {{agentName}} (@{{twitterUserName}}). You MUST include an action if the current post text includes a prompt that is similar to one of the available actions mentioned here:
{{actionNames}}
{{actions}}

Here is the current post text again. Remember to include an action if the current post text includes a prompt that asks for one of the available actions mentioned above (does not need to be exact)
{{currentPost}}
Here is the descriptions of images in the Current post.
{{imageDescriptions}}

Please visit http://localhost:3000/bets to view your bets
` + messageCompletionFooter;

const betResponseTemplate = `# Areas of Expertise
{{knowledge}}

# About {{agentName}} (@{{twitterUserName}}):
{{bio}}
{{lore}}
{{topics}}

{{providers}}

{{characterPostExamples}}

{{postDirections}}

Recent interactions between {{agentName}} and other users:
{{recentPostInteractions}}

{{recentPosts}}

# TASK: Generate a post/reply in the voice, style and perspective of {{agentName}} (@{{twitterUserName}}) while using the thread of tweets as additional context:

Current Post:
{{currentPost}}
Here is the descriptions of images in the Current post.
{{imageDescriptions}}

Thread of Tweets You Are Replying To:
{{formattedConversation}}

# INSTRUCTIONS: Generate a post in the voice, style and perspective of {{agentName}} (@{{twitterUserName}}). You MUST include an action if the current post text includes a prompt that is similar to one of the available actions mentioned here:
{{actionNames}}
{{actions}}

Here is the current post text again. Remember to include an action if the current post text includes a prompt that asks for one of the available actions mentioned above (does not need to be exact)
{{currentPost}}
Here is the descriptions of images in the Current post.
{{imageDescriptions}}

Please visit http://localhost:3000/bets to view your bets`;

export const twitterShouldRespondTemplate = (targetUsersStr: string) =>
    `# INSTRUCTIONS: Determine if {{agentName}} (@{{twitterUserName}}) should respond to the message and participate in the conversation. Do not comment. Just respond with "true" or "false".

Response options are RESPOND, IGNORE and STOP.

PRIORITY RULE: ALWAYS RESPOND to these users regardless of topic or message content: ${targetUsersStr}. Topic relevance should be ignored for these users.

For other users:
- {{agentName}} should RESPOND to any message that mentions them (@{{twitterUserName}}) - this includes both direct mentions and mentions in replies
- {{agentName}} should RESPOND to any replies to their own posts/tweets
- {{agentName}} should RESPOND to conversations relevant to their background 
- {{agentName}} should STOP if asked to stop
- {{agentName}} should STOP if conversation is concluded
- {{agentName}} is in a room with other users and wants to be conversational and engaging

IMPORTANT:
- {{agentName}} (aka @{{twitterUserName}}) should engage with ANY user that mentions them, whether in a new tweet or a reply
- {{agentName}} should respond to replies on their own posts even if they don't include a mention
- {{agentName}} should check both the current post and the thread of tweets for mentions of @{{twitterUserName}}
- {{agentName}} (@{{twitterUserName}}) should aim to be helpful and responsive to all interactions

Recent Posts:
{{recentPosts}}

Current Post:
{{currentPost}}

Thread of Tweets You Are Replying To:
{{formattedConversation}}

# INSTRUCTIONS: Respond with [RESPOND] if {{agentName}} should respond, or [IGNORE] if {{agentName}} should not respond to the last message and [STOP] if {{agentName}} should stop participating in the conversation.
` + shouldRespondFooter;

export const twitterBetRequestTemplate =
    `# INSTRUCTIONS: Determine if this is a request to create a bet. Analyze the message for betting-related keywords and intent.

Current Message:
{{currentPost}}

Thread Context:
{{formattedConversation}}

Check if the message:
1. Explicitly asks to create/make a bet
2. Mentions betting/wagering
3. Asks for odds or predictions that could be bet on
4. Tags @{{twitterUserName}} requesting bet creation

Examples of bet requests:
- "Create a bet on the election winner @{{twitterUserName}}"
- "Hey @{{twitterUserName}} let's make a wager on who wins"
- "@{{twitterUserName}} what are the odds for the game tonight?"
- "@{{twitterUserName}} set up a bet for the championship"

# INSTRUCTIONS: Respond with [RESPOND] if this is a request to create a bet, or [IGNORE] if it is not.
` + shouldRespondFooter;

export const twitterBetResponseTemplate =
    `
# INSTRUCTIONS: Extract the details of the bet from the conversation.

Current Post:
{{currentPost}}

Analyze the conversation to identify:
1. What is being bet on (the event/outcome)
2. The possible outcomes
3. Any specific odds or amounts mentioned
4. Who is involved in the bet
5. Any time constraints or deadlines

Example bet descriptions:
- "Betting on the Lakers vs Warriors game tonight, Lakers to win"
- "Presidential election outcome in November, Biden vs Trump"
- "World Cup final winner, odds at 2:1"

# INSTRUCTIONS: Respond with:
[Bet description in 1-2 sentences]
` + messageCompletionFooter;

export const twitterCreateTokenShouldRespondTemplate =
    `# INSTRUCTIONS: Determine if this is a request to create a token.

Current Post:
{{currentPost}}

Thread Context:
{{formattedConversation}}

Check if the message:
1. Contains phrases like "launch a token", "create a token", "make a token"
2. Includes a description or theme for the token
3. Tags @{{twitterUserName}} requesting token creation
4. Mentions meme tokens or token launches

Examples of token creation requests:
- "Hey @{{twitterUserName}} launch a token based on this meme"
- "@{{twitterUserName}} create a token about cats"
- "Can you make a token with this joke @{{twitterUserName}}"
- "@{{twitterUserName}} let's launch a token about AI"

# INSTRUCTIONS: Respond with [RESPOND] if this is a request to create a token, or [IGNORE] if it is not.
` + shouldRespondFooter;

export const twitterCreateTokenResponseTemplate =
    `# INSTRUCTIONS: Extract the details of the token from the conversation.

Current Post:
{{currentPost}}

Thread Context:
{{formattedConversation}}

Analyze the conversation to identify:
1. The theme or concept for the token
2. Any specific features or utilities mentioned
3. The target community or audience
4. Any suggested tokenomics or distribution
5. Branding elements or meme references

Example token descriptions:
- "AI-powered meme token with community governance"
- "Cat-themed token with charity donations to shelters"
- "Gaming token with in-game utility and rewards"
- "Web3 social token for content creators"

# INSTRUCTIONS: Respond with:
[Make a joke about the token in 1-2 sentences]
` + messageCompletionFooter;

export class TwitterInteractionClient {
    client: ClientBase;
    runtime: IAgentRuntime;
    private isDryRun: boolean;
    constructor(client: ClientBase, runtime: IAgentRuntime) {
        this.client = client;
        this.runtime = runtime;
        this.isDryRun = this.client.twitterConfig.TWITTER_DRY_RUN;
    }

    async start() {
        const handleTwitterInteractionsLoop = () => {
            this.handleTwitterInteractions();
            setTimeout(
                handleTwitterInteractionsLoop,
                // Defaults to 2 minutes
                this.client.twitterConfig.TWITTER_POLL_INTERVAL * 1000
            );
        };
        handleTwitterInteractionsLoop();
    }

    async handleTwitterInteractions() {
        elizaLogger.log("Checking Twitter interactions");

        const twitterUsername = this.client.profile.username;
        try {
            // Check for mentions
            const mentionCandidates = (
                await this.client.fetchSearchTweets(
                    `@${twitterUsername}`,
                    20,
                    SearchMode.Latest
                )
            ).tweets;

            elizaLogger.log(
                "Completed checking mentioned tweets:",
                mentionCandidates.length
            );
            let uniqueTweetCandidates = [...mentionCandidates];
            // Only process target users if configured
            if (this.client.twitterConfig.TWITTER_TARGET_USERS.length) {
                const TARGET_USERS =
                    this.client.twitterConfig.TWITTER_TARGET_USERS;

                elizaLogger.log("Processing target users:", TARGET_USERS);

                if (TARGET_USERS.length > 0) {
                    // Create a map to store tweets by user
                    const tweetsByUser = new Map<string, Tweet[]>();

                    // Fetch tweets from all target users
                    for (const username of TARGET_USERS) {
                        try {
                            const userTweets = (
                                await this.client.twitterClient.fetchSearchTweets(
                                    `from:${username}`,
                                    3,
                                    SearchMode.Latest
                                )
                            ).tweets;

                            // Filter for unprocessed, non-reply, recent tweets
                            const validTweets = userTweets.filter((tweet) => {
                                const isUnprocessed =
                                    !this.client.lastCheckedTweetId ||
                                    Number.parseInt(tweet.id) >
                                        this.client.lastCheckedTweetId;
                                const isRecent =
                                    Date.now() - tweet.timestamp * 1000 <
                                    2 * 60 * 60 * 1000;

                                elizaLogger.log(`Tweet ${tweet.id} checks:`, {
                                    isUnprocessed,
                                    isRecent,
                                    isReply: tweet.isReply,
                                    isRetweet: tweet.isRetweet,
                                });

                                return (
                                    isUnprocessed &&
                                    !tweet.isReply &&
                                    !tweet.isRetweet &&
                                    isRecent
                                );
                            });

                            if (validTweets.length > 0) {
                                tweetsByUser.set(username, validTweets);
                                elizaLogger.log(
                                    `Found ${validTweets.length} valid tweets from ${username}`
                                );
                            }
                        } catch (error) {
                            elizaLogger.error(
                                `Error fetching tweets for ${username}:`,
                                error
                            );
                            continue;
                        }
                    }

                    // Select one tweet from each user that has tweets
                    const selectedTweets: Tweet[] = [];
                    for (const [username, tweets] of Array.from(tweetsByUser)) {
                        if (tweets.length > 0) {
                            // Randomly select one tweet from this user
                            const randomTweet =
                                tweets[
                                    Math.floor(Math.random() * tweets.length)
                                ];
                            selectedTweets.push(randomTweet);
                            elizaLogger.log(
                                `Selected tweet from ${username}: ${randomTweet.text?.substring(
                                    0,
                                    100
                                )}`
                            );
                        }
                    }

                    // Add selected tweets to candidates
                    uniqueTweetCandidates = [
                        ...mentionCandidates,
                        ...selectedTweets,
                    ];
                }
            } else {
                elizaLogger.log(
                    "No target users configured, processing only mentions"
                );
            }

            // Sort tweet candidates by ID in ascending order
            uniqueTweetCandidates
                .sort((a, b) => a.id.localeCompare(b.id))
                .filter((tweet) => tweet.userId !== this.client.profile.id);

            // for each tweet candidate, handle the tweet
            for (const tweet of uniqueTweetCandidates) {
                if (
                    !this.client.lastCheckedTweetId ||
                    BigInt(tweet.id) > this.client.lastCheckedTweetId
                ) {
                    // Generate the tweetId UUID the same way it's done in handleTweet
                    const tweetId = stringToUuid(
                        tweet.id + "-" + this.runtime.agentId
                    );

                    // Check if we've already processed this tweet
                    const existingResponse =
                        await this.runtime.messageManager.getMemoryById(
                            tweetId
                        );

                    if (existingResponse) {
                        elizaLogger.log(
                            `Already responded to tweet ${tweet.id}, skipping`
                        );
                        continue;
                    }
                    elizaLogger.log("New Tweet found", tweet.permanentUrl);

                    const roomId = stringToUuid(
                        tweet.conversationId + "-" + this.runtime.agentId
                    );

                    const userIdUUID =
                        tweet.userId === this.client.profile.id
                            ? this.runtime.agentId
                            : stringToUuid(tweet.userId!);

                    await this.runtime.ensureConnection(
                        userIdUUID,
                        roomId,
                        tweet.username,
                        tweet.name,
                        "twitter"
                    );

                    const thread = await buildConversationThread(
                        tweet,
                        this.client
                    );

                    const message = {
                        content: {
                            text: tweet.text,
                            imageUrls:
                                tweet.photos?.map((photo) => photo.url) || [],
                        },
                        agentId: this.runtime.agentId,
                        userId: userIdUUID,
                        roomId,
                    };

                    await this.handleTweet({
                        tweet,
                        message,
                        thread,
                    });

                    // Update the last checked tweet ID after processing each tweet
                    this.client.lastCheckedTweetId = BigInt(tweet.id);
                }
            }

            // Save the latest checked tweet ID to the file
            await this.client.cacheLatestCheckedTweetId();

            elizaLogger.log("Finished checking Twitter interactions");
        } catch (error) {
            elizaLogger.error("Error handling Twitter interactions:", error);
        }
    }

    private async handleTweet({
        tweet,
        message,
        thread,
    }: {
        tweet: Tweet;
        message: Memory;
        thread: Tweet[];
    }) {
        // Only skip if tweet is from self AND not from a target user
        if (
            tweet.userId === this.client.profile.id &&
            !this.client.twitterConfig.TWITTER_TARGET_USERS.includes(
                tweet.username
            )
        ) {
            return;
        }

        if (!message.content.text) {
            elizaLogger.log("Skipping Tweet with no text", tweet.id);
            return { text: "", action: "IGNORE" };
        }

        elizaLogger.log("Processing Tweet: ", tweet.id);
        const formatTweet = (tweet: Tweet) => {
            return `  ID: ${tweet.id}
  From: ${tweet.name} (@${tweet.username})
  Text: ${tweet.text}`;
        };
        const currentPost = formatTweet(tweet);

        const formattedConversation = thread
            .map(
                (tweet) => `@${tweet.username} (${new Date(
                    tweet.timestamp * 1000
                ).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    month: "short",
                    day: "numeric",
                })}):
        ${tweet.text}`
            )
            .join("\n\n");

        const imageDescriptionsArray = [];
        try {
            for (const photo of tweet.photos) {
                const description = await this.runtime
                    .getService<IImageDescriptionService>(
                        ServiceType.IMAGE_DESCRIPTION
                    )
                    .describeImage(photo.url);
                imageDescriptionsArray.push(description);
            }
        } catch (error) {
            // Handle the error
            elizaLogger.error("Error Occured during describing image: ", error);
        }

        let state = await this.runtime.composeState(message, {
            twitterClient: this.client.twitterClient,
            twitterUserName: this.client.twitterConfig.TWITTER_USERNAME,
            currentPost,
            formattedConversation,
            imageDescriptions:
                imageDescriptionsArray.length > 0
                    ? `\nImages in Tweet:\n${imageDescriptionsArray
                          .map(
                              (desc, i) =>
                                  `Image ${i + 1}: Title: ${
                                      desc.title
                                  }\nDescription: ${desc.description}`
                          )
                          .join("\n\n")}`
                    : "",
        });

        // check if the tweet exists, save if it doesn't
        const tweetId = stringToUuid(tweet.id + "-" + this.runtime.agentId);
        const tweetExists = await this.runtime.messageManager.getMemoryById(
            tweetId
        );

        if (!tweetExists) {
            elizaLogger.log("tweet does not exist, saving");
            const userIdUUID = stringToUuid(tweet.userId as string);
            const roomId = stringToUuid(tweet.conversationId);

            const message = {
                id: tweetId,
                agentId: this.runtime.agentId,
                content: {
                    text: tweet.text,
                    url: tweet.permanentUrl,
                    imageUrls: tweet.photos?.map((photo) => photo.url) || [],
                    inReplyTo: tweet.inReplyToStatusId
                        ? stringToUuid(
                              tweet.inReplyToStatusId +
                                  "-" +
                                  this.runtime.agentId
                          )
                        : undefined,
                },
                userId: userIdUUID,
                roomId,
                createdAt: tweet.timestamp * 1000,
            };
            this.client.saveRequestMessage(message, state);
        }

        // get usernames into str
        const validTargetUsersStr =
            this.client.twitterConfig.TWITTER_TARGET_USERS.join(",");

        const shouldRespondContext = composeContext({
            state,
            template:
                this.runtime.character.templates
                    ?.twitterShouldRespondTemplate ||
                this.runtime.character?.templates?.shouldRespondTemplate ||
                twitterShouldRespondTemplate(validTargetUsersStr),
        });

        const isBetRequest = composeContext({
            state,
            template: twitterBetRequestTemplate,
        });

        const isBetRequestResponse = await generateShouldRespond({
            runtime: this.runtime,
            context: isBetRequest,
            modelClass: ModelClass.MEDIUM,
        });

        const isTokenRequest = composeContext({
            state,
            template: twitterCreateTokenShouldRespondTemplate,
        });

        const isTokenRequestResponse = await generateShouldRespond({
            runtime: this.runtime,
            context: isTokenRequest,
            modelClass: ModelClass.MEDIUM,
        });

        if (isTokenRequestResponse === "RESPOND") {
            elizaLogger.log("Token request detected, creating token");
            const tokenContext = composeContext({
                state,
                template: twitterCreateTokenResponseTemplate,
            });

            const tokenResponse = await generateMessageResponse({
                runtime: this.runtime,
                context: tokenContext,
                modelClass: ModelClass.MEDIUM,
            });

            elizaLogger.log("Token response", tokenResponse.text);
            try {
                elizaLogger.log(
                    "Creating token body",
                    JSON.stringify({
                        isTwitter: true,
                        twitterHandle: tweet.username,
                        input: tokenResponse.text,
                    })
                );
                const res = await fetch(
                    "http://localhost:3000/api/memecoin/create-for-user-tag",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            isTwitter: true,
                            twitterHandle: tweet.username,
                            input: tokenResponse.text,
                        }),
                    }
                );

                if (!res.ok) {
                    tokenResponse.text = `Error creating token, please try again later`;
                    await sendTweet(
                        this.client,
                        tokenResponse,
                        message.roomId,
                        this.client.twitterConfig.TWITTER_USERNAME,
                        tweet.id
                    );
                    return { text: "Token response", action: "NONE" };
                }

                const tokenData = await res.json();
                elizaLogger.log("Successfully created token");
                elizaLogger.log("Token data", tokenData);
                tokenResponse.text = `Hey @${tweet.username}, ${tokenResponse.text}, please visit ${tokenData.redirectUrl} to view your launched tokens`;
                await sendTweet(
                    this.client,
                    tokenResponse,
                    message.roomId,
                    this.client.twitterConfig.TWITTER_USERNAME,
                    tweet.id
                );
                return { text: "Token response", action: "NONE" };
            } catch (error) {
                elizaLogger.error("Error creating token:", error);
            }
        }

        if (isBetRequestResponse === "RESPOND") {
            elizaLogger.log("Bet request detected, creating bet");
            const betContext = composeContext({
                state,
                template: twitterBetResponseTemplate,
            });
            elizaLogger.log("Bet context", betContext);
            const betResponse = await generateMessageResponse({
                runtime: this.runtime,
                context: betContext,
                modelClass: ModelClass.SMALL,
            });
            elizaLogger.log("Bet init");
            elizaLogger.log("Bet response", betResponse.text);
            try {
                // Use fixed small values that ethers can handle
                const joinAmountWei = "4000000000000"; // 0.000004 ETH in wei (fixed value)
                const initialPoolAmountWei = "4000000000000"; // 0.000004 ETH in wei (fixed value)

                elizaLogger.log(
                    `Creating bet with joinAmount: 0.000004 ETH, initialPoolAmount: 0.000004 ETH`
                );

                const res = await fetch(
                    "http://localhost:3000/api/bets/create-for-user",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            twitterHandle: tweet.username,
                            title: betResponse.text,
                            description: betResponse.text,
                            category: "Twitter Bet",
                            endDate: Math.floor(Date.now() / 1000) + 604800, // 7 days from now
                            amount: joinAmountWei,
                            initialPoolAmount: initialPoolAmountWei,
                            imageURL: "/placeholder.svg",
                        }),
                    }
                );

                if (!res.ok) {
                    betResponse.text = `Error creating bet, please try again later`;
                    await sendTweet(
                        this.client,
                        betResponse,
                        message.roomId,
                        this.client.twitterConfig.TWITTER_USERNAME,
                        tweet.id
                    );
                    return { text: "Bet response", action: "NONE" };
                }

                const betData = await res.json();
                elizaLogger.log("Successfully created bet");
                console.log("betData", betData);
                // Store the bet URL for later use
                state.betUrl = betData.redirectUrl;
                betResponse.text = `Hey @${tweet.username}, bet created successfully! View and place your bet here: ${state.betUrl}`;
                await sendTweet(
                    this.client,
                    betResponse,
                    message.roomId,
                    this.client.twitterConfig.TWITTER_USERNAME,
                    tweet.id
                );
                return { text: "Bet response", action: "NONE" };
            } catch (error) {
                elizaLogger.error("Error creating bet:", error);
            }
        }

        const shouldRespond = await generateShouldRespond({
            runtime: this.runtime,
            context: shouldRespondContext,
            modelClass: ModelClass.MEDIUM,
        });

        // Promise<"RESPOND" | "IGNORE" | "STOP" | null> {
        if (shouldRespond !== "RESPOND") {
            elizaLogger.log("Not responding to message");
            return { text: "Response Decision:", action: shouldRespond };
        }
        const context = composeContext({
            state: {
                ...state,
                // Convert actionNames array to string
                actionNames: Array.isArray(state.actionNames)
                    ? state.actionNames.join(", ")
                    : state.actionNames || "",
                actions: Array.isArray(state.actions)
                    ? state.actions.join("\n")
                    : state.actions || "",
                // Ensure character examples are included
                characterPostExamples: this.runtime.character.messageExamples
                    ? this.runtime.character.messageExamples
                          .map((example) =>
                              example
                                  .map(
                                      (msg) =>
                                          `${msg.user}: ${msg.content.text}${
                                              msg.content.action
                                                  ? ` [Action: ${msg.content.action}]`
                                                  : ""
                                          }`
                                  )
                                  .join("\n")
                          )
                          .join("\n\n")
                    : "",
            },
            template:
                this.runtime.character.templates
                    ?.twitterMessageHandlerTemplate ||
                this.runtime.character?.templates?.messageHandlerTemplate ||
                twitterMessageHandlerTemplate,
        });

        const response = await generateMessageResponse({
            runtime: this.runtime,
            context,
            modelClass: ModelClass.LARGE,
        });

        const removeQuotes = (str: string) =>
            str.replace(/^['"](.*)['"]$/, "$1");

        const stringId = stringToUuid(tweet.id + "-" + this.runtime.agentId);

        response.inReplyTo = stringId;

        // Override response text with custom bet creation message if we have a bet URL
        if (state.betUrl) {
            response.text = `Hey @${tweet.username}, bet created successfully! View and place your bet here: ${state.betUrl}`;
        } else {
            response.text = removeQuotes(response.text);
        }

        // Remove the URL section completely - we don't need it in every response
        // Only bet-specific responses will have their URLs

        if (response.text) {
            if (this.isDryRun) {
                elizaLogger.info(
                    `Dry run: Selected Post: ${tweet.id} - ${tweet.username}: ${tweet.text}\nAgent's Output:\n${response.text}`
                );
            } else {
                try {
                    const callback: HandlerCallback = async (
                        response: Content,
                        tweetId?: string
                    ) => {
                        const memories = await sendTweet(
                            this.client,
                            response,
                            message.roomId,
                            this.client.twitterConfig.TWITTER_USERNAME,
                            tweetId || tweet.id
                        );
                        return memories;
                    };

                    const action = this.runtime.actions.find(
                        (a) => a.name === response.action
                    );
                    const shouldSuppressInitialMessage =
                        action?.suppressInitialMessage;

                    let responseMessages = [];

                    if (!shouldSuppressInitialMessage) {
                        responseMessages = await callback(response);
                    } else {
                        responseMessages = [
                            {
                                id: stringToUuid(
                                    tweet.id + "-" + this.runtime.agentId
                                ),
                                userId: this.runtime.agentId,
                                agentId: this.runtime.agentId,
                                content: response,
                                roomId: message.roomId,
                                embedding: getEmbeddingZeroVector(),
                                createdAt: Date.now(),
                            },
                        ];
                    }

                    state = (await this.runtime.updateRecentMessageState(
                        state
                    )) as State;

                    for (const responseMessage of responseMessages) {
                        if (
                            responseMessage ===
                            responseMessages[responseMessages.length - 1]
                        ) {
                            responseMessage.content.action = response.action;
                        } else {
                            responseMessage.content.action = "CONTINUE";
                        }
                        await this.runtime.messageManager.createMemory(
                            responseMessage
                        );
                    }

                    const responseTweetId =
                        responseMessages[responseMessages.length - 1]?.content
                            ?.tweetId;

                    await this.runtime.processActions(
                        message,
                        responseMessages,
                        state,
                        (response: Content) => {
                            return callback(response, responseTweetId);
                        }
                    );

                    const responseInfo = `Context:\n\n${context}\n\nSelected Post: ${tweet.id} - ${tweet.username}: ${tweet.text}\nAgent's Output:\n${response.text}`;

                    await this.runtime.cacheManager.set(
                        `twitter/tweet_generation_${tweet.id}.txt`,
                        responseInfo
                    );
                    await wait();
                } catch (error) {
                    elizaLogger.error(`Error sending response tweet: ${error}`);
                }
            }
        }
    }

    async buildConversationThread(
        tweet: Tweet,
        maxReplies = 10
    ): Promise<Tweet[]> {
        const thread: Tweet[] = [];
        const visited: Set<string> = new Set();

        async function processThread(currentTweet: Tweet, depth = 0) {
            elizaLogger.log("Processing tweet:", {
                id: currentTweet.id,
                inReplyToStatusId: currentTweet.inReplyToStatusId,
                depth: depth,
            });

            if (!currentTweet) {
                elizaLogger.log("No current tweet found for thread building");
                return;
            }

            if (depth >= maxReplies) {
                elizaLogger.log("Reached maximum reply depth", depth);
                return;
            }

            // Handle memory storage
            const memory = await this.runtime.messageManager.getMemoryById(
                stringToUuid(currentTweet.id + "-" + this.runtime.agentId)
            );
            if (!memory) {
                const roomId = stringToUuid(
                    currentTweet.conversationId + "-" + this.runtime.agentId
                );
                const userId = stringToUuid(currentTweet.userId);

                await this.runtime.ensureConnection(
                    userId,
                    roomId,
                    currentTweet.username,
                    currentTweet.name,
                    "twitter"
                );

                this.runtime.messageManager.createMemory({
                    id: stringToUuid(
                        currentTweet.id + "-" + this.runtime.agentId
                    ),
                    agentId: this.runtime.agentId,
                    content: {
                        text: currentTweet.text,
                        source: "twitter",
                        url: currentTweet.permanentUrl,
                        imageUrls:
                            currentTweet.photos?.map((photo) => photo.url) ||
                            [],
                        inReplyTo: currentTweet.inReplyToStatusId
                            ? stringToUuid(
                                  currentTweet.inReplyToStatusId +
                                      "-" +
                                      this.runtime.agentId
                              )
                            : undefined,
                    },
                    createdAt: currentTweet.timestamp * 1000,
                    roomId,
                    userId:
                        currentTweet.userId === this.twitterUserId
                            ? this.runtime.agentId
                            : stringToUuid(currentTweet.userId),
                    embedding: getEmbeddingZeroVector(),
                });
            }

            if (visited.has(currentTweet.id)) {
                elizaLogger.log("Already visited tweet:", currentTweet.id);
                return;
            }

            visited.add(currentTweet.id);
            thread.unshift(currentTweet);

            if (currentTweet.inReplyToStatusId) {
                elizaLogger.log(
                    "Fetching parent tweet:",
                    currentTweet.inReplyToStatusId
                );
                try {
                    const parentTweet = await this.twitterClient.getTweet(
                        currentTweet.inReplyToStatusId
                    );

                    if (parentTweet) {
                        elizaLogger.log("Found parent tweet:", {
                            id: parentTweet.id,
                            text: parentTweet.text?.slice(0, 50),
                        });
                        await processThread(parentTweet, depth + 1);
                    } else {
                        elizaLogger.log(
                            "No parent tweet found for:",
                            currentTweet.inReplyToStatusId
                        );
                    }
                } catch (error) {
                    elizaLogger.log("Error fetching parent tweet:", {
                        tweetId: currentTweet.inReplyToStatusId,
                        error,
                    });
                }
            } else {
                elizaLogger.log(
                    "Reached end of reply chain at:",
                    currentTweet.id
                );
            }
        }

        // Need to bind this context for the inner function
        await processThread.bind(this)(tweet, 0);

        return thread;
    }
}

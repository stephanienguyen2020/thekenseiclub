export declare const OpenAIContextAwareAgent: {
    new (params: import("./contextAwareMixin.js").AgentParams & import("./contextAwareMixin.js").ContextAwareConfig): {
        readonly contextRetriever: import("@llamaindex/core/retriever").BaseRetriever;
        retrievedContext: string | null;
        retrieveContext(query: import("@llamaindex/core/llms").MessageContent): Promise<string>;
        injectContext(context: string): Promise<void>;
        chat(params: import("@llamaindex/core/chat-engine").NonStreamingChatEngineParams): Promise<import("@llamaindex/core/schema").EngineResponse>;
        chat(params: import("@llamaindex/core/chat-engine").StreamingChatEngineParams): Promise<ReadableStream<import("@llamaindex/core/schema").EngineResponse>>;
        createStore: typeof import("@llamaindex/core/agent").AgentRunner.defaultCreateStore;
        taskHandler: import("@llamaindex/core/agent").TaskHandler<import("@llamaindex/core/llms").LLM<object, object>>;
        "__#11@#private": any;
        readonly llm: import("@llamaindex/core/llms").LLM<object, object>;
        readonly chatHistory: import("@llamaindex/core/llms").ChatMessage<object>[];
        readonly verbose: boolean;
        reset(): void;
        getTools(query: import("@llamaindex/core/llms").MessageContent): Promise<import("@llamaindex/core/llms").BaseToolWithCall[]> | import("@llamaindex/core/llms").BaseToolWithCall[];
        createTask(message: import("@llamaindex/core/llms").MessageContent, stream?: boolean, verbose?: boolean | undefined, chatHistory?: import("@llamaindex/core/llms").ChatMessage<object>[] | undefined, additionalChatOptions?: object | undefined): ReadableStream<{
            taskStep: import("@llamaindex/core/agent").TaskStep<import("@llamaindex/core/llms").LLM<object, object>, object, object, object>;
            output: import("@llamaindex/core/llms").ChatResponse<object> | ReadableStream<import("@llamaindex/core/llms").ChatResponseChunk<object>>;
            isLast: boolean;
        }>;
    };
    defaultCreateStore(): object;
    defaultTaskHandler: import("@llamaindex/core/agent").TaskHandler<import("@llamaindex/core/llms").LLM>;
    shouldContinue<AI extends import("@llamaindex/core/llms").LLM, Store extends object = object, AdditionalMessageOptions extends object = AI extends import("@llamaindex/core/llms").LLM<object, infer AdditionalMessageOptions_1 extends object> ? AdditionalMessageOptions_1 : never>(task: Readonly<import("@llamaindex/core/agent").TaskStep<AI, Store, AdditionalMessageOptions>>): boolean;
};
export type { ContextAwareConfig } from "./contextAwareMixin.js";
export * from "@llamaindex/openai";

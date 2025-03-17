import type { NonStreamingChatEngineParams, StreamingChatEngineParams } from "@llamaindex/core/chat-engine";
import type { MessageContent } from "@llamaindex/core/llms";
import type { BaseRetriever } from "@llamaindex/core/retriever";
import { EngineResponse } from "@llamaindex/core/schema";
import { OpenAIAgent, type OpenAIAgentParams } from "@llamaindex/openai";
export interface ContextAwareConfig {
    contextRetriever: BaseRetriever;
}
export interface ContextAwareState {
    contextRetriever: BaseRetriever;
    retrievedContext: string | null;
}
export type SupportedAgent = typeof OpenAIAgent;
export type AgentParams = OpenAIAgentParams;
/**
 * ContextAwareAgentRunner enhances the base AgentRunner with the ability to retrieve and inject relevant context
 * for each query. This allows the agent to access and utilize appropriate information from a given index or retriever,
 * providing more informed and context-specific responses to user queries.
 */
export declare function withContextAwareness(Base: SupportedAgent): {
    new (params: AgentParams & ContextAwareConfig): {
        readonly contextRetriever: BaseRetriever;
        retrievedContext: string | null;
        retrieveContext(query: MessageContent): Promise<string>;
        injectContext(context: string): Promise<void>;
        chat(params: NonStreamingChatEngineParams): Promise<EngineResponse>;
        chat(params: StreamingChatEngineParams): Promise<ReadableStream<EngineResponse>>;
        createStore: typeof import("@llamaindex/core/agent").AgentRunner.defaultCreateStore;
        taskHandler: import("@llamaindex/core/agent").TaskHandler<import("@llamaindex/core/llms").LLM<object, object>>;
        "__#11@#private": any;
        readonly llm: import("@llamaindex/core/llms").LLM<object, object>;
        readonly chatHistory: import("@llamaindex/core/llms").ChatMessage<object>[];
        readonly verbose: boolean;
        reset(): void;
        getTools(query: MessageContent): Promise<import("@llamaindex/core/llms").BaseToolWithCall[]> | import("@llamaindex/core/llms").BaseToolWithCall[];
        createTask(message: MessageContent, stream?: boolean, verbose?: boolean | undefined, chatHistory?: import("@llamaindex/core/llms").ChatMessage<object>[] | undefined, additionalChatOptions?: object | undefined): ReadableStream<{
            taskStep: import("@llamaindex/core/agent").TaskStep<import("@llamaindex/core/llms").LLM<object, object>, object, object, object>;
            output: import("@llamaindex/core/llms").ChatResponse<object> | ReadableStream<import("@llamaindex/core/llms").ChatResponseChunk<object>>;
            isLast: boolean;
        }>;
    };
    defaultCreateStore(): object;
    defaultTaskHandler: import("@llamaindex/core/agent").TaskHandler<import("@llamaindex/core/llms").LLM>;
    shouldContinue<AI extends import("@llamaindex/core/llms").LLM, Store extends object = object, AdditionalMessageOptions extends object = AI extends import("@llamaindex/core/llms").LLM<object, infer AdditionalMessageOptions_1 extends object> ? AdditionalMessageOptions_1 : never>(task: Readonly<import("@llamaindex/core/agent").TaskStep<AI, Store, AdditionalMessageOptions>>): boolean;
};

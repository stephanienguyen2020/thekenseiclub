import type { BaseChatEngine, ContextChatEngineOptions } from "@llamaindex/core/chat-engine";
import type { ToolMetadata } from "@llamaindex/core/llms";
import type { BaseQueryEngine } from "@llamaindex/core/query-engine";
import type { BaseSynthesizer } from "@llamaindex/core/response-synthesizers";
import type { BaseRetriever } from "@llamaindex/core/retriever";
import type { BaseNode, Document } from "@llamaindex/core/schema";
import type { BaseDocumentStore } from "@llamaindex/core/storage/doc-store";
import type { BaseIndexStore } from "@llamaindex/core/storage/index-store";
import type { JSONSchemaType } from "ajv";
import type { StorageContext } from "../storage/StorageContext.js";
import { type QueryEngineParam, QueryEngineTool } from "../tools/QueryEngineTool.js";
export interface BaseIndexInit<T> {
    storageContext: StorageContext;
    docStore: BaseDocumentStore;
    indexStore?: BaseIndexStore | undefined;
    indexStruct: T;
}
/**
 * Common parameter type for queryTool and asQueryTool
 */
export type QueryToolParams = ({
    options: any;
    retriever?: never;
} | {
    options?: never;
    retriever?: BaseRetriever;
}) & {
    responseSynthesizer?: BaseSynthesizer;
    metadata?: ToolMetadata<JSONSchemaType<QueryEngineParam>> | undefined;
};
/**
 * Indexes are the data structure that we store our nodes and embeddings in so
 * they can be retrieved for our queries.
 */
export declare abstract class BaseIndex<T> {
    storageContext: StorageContext;
    docStore: BaseDocumentStore;
    indexStore?: BaseIndexStore | undefined;
    indexStruct: T;
    constructor(init: BaseIndexInit<T>);
    /**
     * Create a new retriever from the index.
     * @param options
     */
    abstract asRetriever(options?: any): BaseRetriever;
    /**
     * Create a new query engine from the index. It will also create a retriever
     * and response synthezier if they are not provided.
     * @param options you can supply your own custom Retriever and ResponseSynthesizer
     */
    abstract asQueryEngine(options?: {
        retriever?: BaseRetriever;
        responseSynthesizer?: BaseSynthesizer;
    }): BaseQueryEngine;
    /**
     * Create a new chat engine from the index.
     * @param options
     */
    abstract asChatEngine(options?: Omit<ContextChatEngineOptions, "retriever">): BaseChatEngine;
    /**
     * Returns a query tool by calling asQueryEngine.
     * Either options or retriever can be passed, but not both.
     * If options are provided, they are passed to generate a retriever.
     */
    asQueryTool(params: QueryToolParams): QueryEngineTool;
    /**
     * Insert a document into the index.
     * @param document
     */
    insert(document: Document): Promise<void>;
    abstract insertNodes(nodes: BaseNode[]): Promise<void>;
    abstract deleteRefDoc(refDocId: string, deleteFromDocStore?: boolean): Promise<void>;
    /**
     * Alias for asRetriever
     * @param options
     */
    retriever(options?: any): BaseRetriever;
    /**
     * Alias for asQueryEngine
     * @param options you can supply your own custom Retriever and ResponseSynthesizer
     */
    queryEngine(options?: {
        retriever?: BaseRetriever;
        responseSynthesizer?: BaseSynthesizer;
    }): BaseQueryEngine;
    /**
     * Alias for asQueryTool
     * Either options or retriever can be passed, but not both.
     * If options are provided, they are passed to generate a retriever.
     */
    queryTool(params: QueryToolParams): QueryEngineTool;
}

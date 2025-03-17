import type { BaseSynthesizer } from "@llamaindex/core/response-synthesizers";
import type { BaseNode, Document, NodeWithScore } from "@llamaindex/core/schema";
import type { StorageContext } from "../../storage/StorageContext.js";
import type { BaseIndexInit } from "../BaseIndex.js";
import { BaseIndex } from "../BaseIndex.js";
import { KeywordTable } from "@llamaindex/core/data-structs";
import type { LLM } from "@llamaindex/core/llms";
import type { BaseNodePostprocessor } from "@llamaindex/core/postprocessor";
import { type KeywordExtractPrompt, type QueryKeywordExtractPrompt } from "@llamaindex/core/prompts";
import type { BaseQueryEngine, QueryBundle } from "@llamaindex/core/query-engine";
import { BaseRetriever } from "@llamaindex/core/retriever";
import type { BaseDocumentStore } from "@llamaindex/core/storage/doc-store";
import { type BaseChatEngine, type ContextChatEngineOptions } from "../../engines/chat/index.js";
export interface KeywordIndexOptions {
    nodes?: BaseNode[];
    indexStruct?: KeywordTable;
    indexId?: string;
    llm?: LLM;
    storageContext?: StorageContext;
}
export declare enum KeywordTableRetrieverMode {
    DEFAULT = "DEFAULT",
    SIMPLE = "SIMPLE",
    RAKE = "RAKE"
}
declare abstract class BaseKeywordTableRetriever extends BaseRetriever {
    protected index: KeywordTableIndex;
    protected indexStruct: KeywordTable;
    protected docstore: BaseDocumentStore;
    protected llm: LLM;
    protected maxKeywordsPerQuery: number;
    protected numChunksPerQuery: number;
    protected keywordExtractTemplate: KeywordExtractPrompt;
    protected queryKeywordExtractTemplate: QueryKeywordExtractPrompt;
    constructor({ index, keywordExtractTemplate, queryKeywordExtractTemplate, maxKeywordsPerQuery, numChunksPerQuery, }: {
        index: KeywordTableIndex;
        keywordExtractTemplate?: KeywordExtractPrompt;
        queryKeywordExtractTemplate?: QueryKeywordExtractPrompt;
        maxKeywordsPerQuery: number;
        numChunksPerQuery: number;
    });
    abstract getKeywords(query: string): Promise<string[]>;
    _retrieve(query: QueryBundle): Promise<NodeWithScore[]>;
}
export declare class KeywordTableLLMRetriever extends BaseKeywordTableRetriever {
    getKeywords(query: string): Promise<string[]>;
}
export declare class KeywordTableSimpleRetriever extends BaseKeywordTableRetriever {
    getKeywords(query: string): Promise<string[]>;
}
export declare class KeywordTableRAKERetriever extends BaseKeywordTableRetriever {
    getKeywords(query: string): Promise<string[]>;
}
export type KeywordTableIndexChatEngineOptions = {
    retriever?: BaseRetriever;
} & Omit<ContextChatEngineOptions, "retriever">;
/**
 * The KeywordTableIndex, an index that extracts keywords from each Node and builds a mapping from each keyword to the corresponding Nodes of that keyword.
 */
export declare class KeywordTableIndex extends BaseIndex<KeywordTable> {
    constructor(init: BaseIndexInit<KeywordTable>);
    static init(options: KeywordIndexOptions): Promise<KeywordTableIndex>;
    asRetriever(options?: any): BaseRetriever;
    asQueryEngine(options?: {
        retriever?: BaseRetriever;
        responseSynthesizer?: BaseSynthesizer;
        preFilters?: unknown;
        nodePostprocessors?: BaseNodePostprocessor[];
    }): BaseQueryEngine;
    asChatEngine(options?: KeywordTableIndexChatEngineOptions): BaseChatEngine;
    static extractKeywords(text: string): Promise<Set<string>>;
    /**
     * High level API: split documents, get keywords, and build index.
     * @param documents
     * @param args
     * @param args.storageContext
     * @returns
     */
    static fromDocuments(documents: Document[], args?: {
        storageContext?: StorageContext;
    }): Promise<KeywordTableIndex>;
    /**
     * Get keywords for nodes and place them into the index.
     * @param nodes
     * @param docStore
     * @returns
     */
    static buildIndexFromNodes(nodes: BaseNode[], docStore: BaseDocumentStore): Promise<KeywordTable>;
    insertNodes(nodes: BaseNode[]): Promise<void>;
    deleteNode(nodeId: string): void;
    deleteNodes(nodeIds: string[], deleteFromDocStore: boolean): Promise<void>;
    deleteRefDoc(refDocId: string, deleteFromDocStore?: boolean): Promise<void>;
}
export {};

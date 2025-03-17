"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BaseIndex", {
    enumerable: true,
    get: function() {
        return BaseIndex;
    }
});
const _IngestionPipeline = require("../ingestion/IngestionPipeline.js");
const _Settings = require("../Settings.js");
const _QueryEngineTool = require("../tools/QueryEngineTool.js");
class BaseIndex {
    storageContext;
    docStore;
    indexStore;
    indexStruct;
    constructor(init){
        this.storageContext = init.storageContext;
        this.docStore = init.docStore;
        this.indexStore = init.indexStore;
        this.indexStruct = init.indexStruct;
    }
    /**
   * Returns a query tool by calling asQueryEngine.
   * Either options or retriever can be passed, but not both.
   * If options are provided, they are passed to generate a retriever.
   */ asQueryTool(params) {
        if (params.options) {
            params.retriever = this.asRetriever(params.options);
        }
        return new _QueryEngineTool.QueryEngineTool({
            queryEngine: this.asQueryEngine(params),
            metadata: params?.metadata
        });
    }
    /**
   * Insert a document into the index.
   * @param document
   */ async insert(document) {
        const nodes = await (0, _IngestionPipeline.runTransformations)([
            document
        ], [
            _Settings.Settings.nodeParser
        ]);
        await this.insertNodes(nodes);
        await this.docStore.setDocumentHash(document.id_, document.hash);
    }
    /**
   * Alias for asRetriever
   * @param options
   */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retriever(options) {
        return this.asRetriever(options);
    }
    /**
   * Alias for asQueryEngine
   * @param options you can supply your own custom Retriever and ResponseSynthesizer
   */ queryEngine(options) {
        return this.asQueryEngine(options);
    }
    /**
   * Alias for asQueryTool
   * Either options or retriever can be passed, but not both.
   * If options are provided, they are passed to generate a retriever.
   */ queryTool(params) {
        return this.asQueryTool(params);
    }
}

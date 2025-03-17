"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "storageContextFromDefaults", {
    enumerable: true,
    get: function() {
        return storageContextFromDefaults;
    }
});
const _global = require("@llamaindex/core/global");
const _schema = require("@llamaindex/core/schema");
const _indexstore = require("@llamaindex/core/storage/index-store");
const _Settings = require("../Settings.js");
const _SimpleVectorStore = require("../vector-store/SimpleVectorStore.js");
const _SimpleDocumentStore = require("./docStore/SimpleDocumentStore.js");
async function storageContextFromDefaults({ docStore, indexStore, vectorStore, vectorStores, persistDir }) {
    vectorStores = vectorStores ?? {};
    if (!persistDir) {
        docStore = docStore ?? new _SimpleDocumentStore.SimpleDocumentStore();
        indexStore = indexStore ?? new _indexstore.SimpleIndexStore();
        if (!(_schema.ModalityType.TEXT in vectorStores)) {
            vectorStores[_schema.ModalityType.TEXT] = vectorStore ?? new _SimpleVectorStore.SimpleVectorStore();
        }
    } else {
        const embedModel = _Settings.Settings.embedModel;
        docStore = docStore || await _SimpleDocumentStore.SimpleDocumentStore.fromPersistDir(persistDir, _global.DEFAULT_NAMESPACE);
        indexStore = indexStore || await _indexstore.SimpleIndexStore.fromPersistDir(persistDir);
        if (!(_schema.ObjectType.TEXT in vectorStores)) {
            vectorStores[_schema.ModalityType.TEXT] = vectorStore ?? await _SimpleVectorStore.SimpleVectorStore.fromPersistDir(persistDir, embedModel);
        }
    }
    return {
        docStore,
        indexStore,
        vectorStores
    };
}

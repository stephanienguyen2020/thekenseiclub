"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Settings", {
    enumerable: true,
    get: function() {
        return Settings;
    }
});
const _global = require("@llamaindex/core/global");
const _indices = require("@llamaindex/core/indices");
const _nodeparser = require("@llamaindex/core/node-parser");
const _env = require("@llamaindex/env");
/**
 * @internal
 */ class GlobalSettings {
    #prompt = {};
    #promptHelper = null;
    #nodeParser = null;
    #chunkOverlap;
    #promptHelperAsyncLocalStorage = new _env.AsyncLocalStorage();
    #nodeParserAsyncLocalStorage = new _env.AsyncLocalStorage();
    #chunkOverlapAsyncLocalStorage = new _env.AsyncLocalStorage();
    #promptAsyncLocalStorage = new _env.AsyncLocalStorage();
    get debug() {
        return _global.Settings.debug;
    }
    get llm() {
        return _global.Settings.llm;
    }
    set llm(llm) {
        _global.Settings.llm = llm;
    }
    withLLM(llm, fn) {
        return _global.Settings.withLLM(llm, fn);
    }
    get promptHelper() {
        if (this.#promptHelper === null) {
            this.#promptHelper = new _indices.PromptHelper();
        }
        return this.#promptHelperAsyncLocalStorage.getStore() ?? this.#promptHelper;
    }
    set promptHelper(promptHelper) {
        this.#promptHelper = promptHelper;
    }
    withPromptHelper(promptHelper, fn) {
        return this.#promptHelperAsyncLocalStorage.run(promptHelper, fn);
    }
    get embedModel() {
        return _global.Settings.embedModel;
    }
    set embedModel(embedModel) {
        _global.Settings.embedModel = embedModel;
    }
    withEmbedModel(embedModel, fn) {
        return _global.Settings.withEmbedModel(embedModel, fn);
    }
    get nodeParser() {
        if (this.#nodeParser === null) {
            this.#nodeParser = new _nodeparser.SentenceSplitter({
                chunkSize: this.chunkSize,
                chunkOverlap: this.chunkOverlap
            });
        }
        return this.#nodeParserAsyncLocalStorage.getStore() ?? this.#nodeParser;
    }
    set nodeParser(nodeParser) {
        this.#nodeParser = nodeParser;
    }
    withNodeParser(nodeParser, fn) {
        return this.#nodeParserAsyncLocalStorage.run(nodeParser, fn);
    }
    get callbackManager() {
        return _global.Settings.callbackManager;
    }
    set callbackManager(callbackManager) {
        _global.Settings.callbackManager = callbackManager;
    }
    withCallbackManager(callbackManager, fn) {
        return _global.Settings.withCallbackManager(callbackManager, fn);
    }
    set chunkSize(chunkSize) {
        _global.Settings.chunkSize = chunkSize;
    }
    get chunkSize() {
        return _global.Settings.chunkSize;
    }
    withChunkSize(chunkSize, fn) {
        return _global.Settings.withChunkSize(chunkSize, fn);
    }
    get chunkOverlap() {
        return this.#chunkOverlapAsyncLocalStorage.getStore() ?? this.#chunkOverlap;
    }
    set chunkOverlap(chunkOverlap) {
        if (typeof chunkOverlap === "number") {
            this.#chunkOverlap = chunkOverlap;
        }
    }
    withChunkOverlap(chunkOverlap, fn) {
        return this.#chunkOverlapAsyncLocalStorage.run(chunkOverlap, fn);
    }
    get prompt() {
        return this.#promptAsyncLocalStorage.getStore() ?? this.#prompt;
    }
    set prompt(prompt) {
        this.#prompt = prompt;
    }
    withPrompt(prompt, fn) {
        return this.#promptAsyncLocalStorage.run(prompt, fn);
    }
}
const Settings = new GlobalSettings();

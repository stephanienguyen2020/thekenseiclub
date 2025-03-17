import { Settings as CoreSettings } from "@llamaindex/core/global";
import { PromptHelper } from "@llamaindex/core/indices";
import { SentenceSplitter } from "@llamaindex/core/node-parser";
import { AsyncLocalStorage } from "@llamaindex/env";
/**
 * @internal
 */ class GlobalSettings {
    #prompt = {};
    #promptHelper = null;
    #nodeParser = null;
    #chunkOverlap;
    #promptHelperAsyncLocalStorage = new AsyncLocalStorage();
    #nodeParserAsyncLocalStorage = new AsyncLocalStorage();
    #chunkOverlapAsyncLocalStorage = new AsyncLocalStorage();
    #promptAsyncLocalStorage = new AsyncLocalStorage();
    get debug() {
        return CoreSettings.debug;
    }
    get llm() {
        return CoreSettings.llm;
    }
    set llm(llm) {
        CoreSettings.llm = llm;
    }
    withLLM(llm, fn) {
        return CoreSettings.withLLM(llm, fn);
    }
    get promptHelper() {
        if (this.#promptHelper === null) {
            this.#promptHelper = new PromptHelper();
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
        return CoreSettings.embedModel;
    }
    set embedModel(embedModel) {
        CoreSettings.embedModel = embedModel;
    }
    withEmbedModel(embedModel, fn) {
        return CoreSettings.withEmbedModel(embedModel, fn);
    }
    get nodeParser() {
        if (this.#nodeParser === null) {
            this.#nodeParser = new SentenceSplitter({
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
        return CoreSettings.callbackManager;
    }
    set callbackManager(callbackManager) {
        CoreSettings.callbackManager = callbackManager;
    }
    withCallbackManager(callbackManager, fn) {
        return CoreSettings.withCallbackManager(callbackManager, fn);
    }
    set chunkSize(chunkSize) {
        CoreSettings.chunkSize = chunkSize;
    }
    get chunkSize() {
        return CoreSettings.chunkSize;
    }
    withChunkSize(chunkSize, fn) {
        return CoreSettings.withChunkSize(chunkSize, fn);
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
export const Settings = new GlobalSettings();

"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getSelectorFromContext", {
    enumerable: true,
    get: function() {
        return getSelectorFromContext;
    }
});
const _Settings = require("../Settings.js");
const _llmSelectors = require("./llmSelectors.js");
const getSelectorFromContext = (isMulti = false)=>{
    let selector = null;
    const llm = _Settings.Settings.llm;
    if (isMulti) {
        selector = new _llmSelectors.LLMMultiSelector({
            llm
        });
    } else {
        selector = new _llmSelectors.LLMSingleSelector({
            llm
        });
    }
    if (selector === null) {
        throw new Error("Selector is null");
    }
    return selector;
};

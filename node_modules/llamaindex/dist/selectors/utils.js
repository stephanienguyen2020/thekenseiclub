import { Settings } from "../Settings.js";
import { LLMMultiSelector, LLMSingleSelector } from "./llmSelectors.js";
export const getSelectorFromContext = (isMulti = false)=>{
    let selector = null;
    const llm = Settings.llm;
    if (isMulti) {
        selector = new LLMMultiSelector({
            llm
        });
    } else {
        selector = new LLMSingleSelector({
            llm
        });
    }
    if (selector === null) {
        throw new Error("Selector is null");
    }
    return selector;
};

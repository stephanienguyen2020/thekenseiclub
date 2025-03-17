import { PromptMixin, type ModuleRecord } from "@llamaindex/core/prompts";
import type { RelevancyEvalPrompt, RelevancyRefinePrompt } from "./prompts.js";
import type { BaseEvaluator, EvaluationResult, EvaluatorParams, EvaluatorResponseParams } from "./types.js";
type RelevancyParams = {
    raiseError?: boolean | undefined;
    evalTemplate?: RelevancyEvalPrompt | undefined;
    refineTemplate?: RelevancyRefinePrompt | undefined;
};
export declare class RelevancyEvaluator extends PromptMixin implements BaseEvaluator {
    private raiseError;
    private evalTemplate;
    private refineTemplate;
    constructor(params?: RelevancyParams);
    protected _getPromptModules(): ModuleRecord;
    _getPrompts(): {
        evalTemplate: RelevancyEvalPrompt;
        refineTemplate: RelevancyRefinePrompt;
    };
    _updatePrompts(prompts: {
        evalTemplate: RelevancyEvalPrompt;
        refineTemplate: RelevancyRefinePrompt;
    }): void;
    evaluate({ query, response, contexts, sleepTimeInSeconds, }: EvaluatorParams): Promise<EvaluationResult>;
    /**
     * @param query Query to evaluate
     * @param response  Response to evaluate
     */
    evaluateResponse({ query, response, }: EvaluatorResponseParams): Promise<EvaluationResult>;
}
export {};

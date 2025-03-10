import { getInferenceAction } from "./actions/getInference";
import { topicsProvider } from "./providers/topics";

export const alloraPlugin = {
    name: "Allora Network plugin",
    description: "Allora Network plugin for Eliza",
    actions: [getInferenceAction as any],
    evaluators: [],
    providers: [topicsProvider as any],
};

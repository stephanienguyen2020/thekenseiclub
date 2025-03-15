import { Plugin } from "@elizaos/core";
import { currentNewsAction } from "./actions/news";
import { launchTokenAction } from "./actions/launch";
import { buyAction } from "./actions/buy";

export const memePlugin: Plugin = {
    name: "memePlugin",
    description: "Action for our meme coin",
    actions: [currentNewsAction, launchTokenAction, buyAction],
};

export default memePlugin;

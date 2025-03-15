import { Plugin } from "@elizaos/core";
import { currentNewsAction } from "./actions/news";
import { launchTokenAction } from "./actions/launch";
import { buyAction } from "./actions/buy";
import { swapAction } from "./actions/swap";

export const memePlugin: Plugin = {
    name: "memePlugin",
    description: "Action for our meme coin",
    actions: [currentNewsAction, launchTokenAction, buyAction, swapAction],
};

export default memePlugin;

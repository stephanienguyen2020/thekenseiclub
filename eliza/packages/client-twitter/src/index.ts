import { TwitterClientInterface, TwitterPostClientInterface } from "./client";

const twitterPlugin = {
    name: "twitter",
    description: "Twitter client",
    clients: [TwitterClientInterface],
};

export { TwitterPostClientInterface };

export default twitterPlugin;

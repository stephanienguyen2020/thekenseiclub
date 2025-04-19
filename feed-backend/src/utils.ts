import {readFileSync} from "fs";
import {homedir} from "os";
import path from "path";
import {getFullnodeUrl, SuiClient} from "@mysten/sui/client";
import {Ed25519Keypair} from "@mysten/sui/keypairs/ed25519";
import {fromBase64} from "@mysten/sui/utils";

export type Network = "mainnet" | "testnet" | "devnet" | "localnet";

export const ACTIVE_NETWORK = (process.env.NETWORK as Network) || "testnet";

export const getSigner = (address: string) => {
    const sender = address;

    const keystore = JSON.parse(
        readFileSync(
            path.join(homedir(), ".sui", "sui_config", "sui.keystore"),
            "utf8"
        )
    );

    for (const priv of keystore) {
        const raw = fromBase64(priv);
        if (raw[0] !== 0) {
            continue;
        }

        const pair = Ed25519Keypair.fromSecretKey(raw.slice(1));
        if (pair.getPublicKey().toSuiAddress() === sender) {
            return pair;
        }
    }

    throw new Error(`keypair not found for sender: ${sender}`);
};

export const getClient = (network: Network) => {
    return new SuiClient({url: getFullnodeUrl(network)});
};

import fs, {readFileSync, writeFileSync} from 'fs';

import {execSync} from "child_process";
import {homedir} from "os";
import path from "path";
import {getFullnodeUrl, SuiClient, SuiObjectChange, SuiTransactionBlockResponse} from "@mysten/sui/client";
import {Ed25519Keypair} from "@mysten/sui/keypairs/ed25519";
import {Transaction} from "@mysten/sui/transactions";
import {fromBase64} from "@mysten/sui/utils";

export type Network = "mainnet" | "testnet" | "devnet" | "localnet";

export const SUI_BIN = `sui`;
export const ACTIVE_NETWORK = (process.env.NETWORK as Network) || "testnet";

export const getActiveAddress = () => {
    return execSync(`${SUI_BIN} client active-address`, {
        encoding: "utf8",
    }).trim();
};

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

export const signAndExecute = async (txb: Transaction, network: Network, address: string) => {
    const signer = getSigner(address);

    const client = getClient(network);

    return client.signAndExecuteTransaction({
        transaction: txb,
        signer,
        options: {
            showEffects: true,
            showObjectChanges: true,
        },
    });
};

export const publishPackage = async ({
                                         packagePath,
                                         network,
                                         exportFileName = "contract",
                                         address
                                     }: {
    packagePath: string;
    network: Network;
    exportFileName: string;
    address: string
}): Promise<SuiTransactionBlockResponse> => {
    const txb = new Transaction();

    const {modules, dependencies} = JSON.parse(
        execSync(
            `${SUI_BIN} move build --dump-bytecode-as-base64 --path ${packagePath}`,
            {
                encoding: "utf-8",
            }
        )
    );

    const cap = txb.publish({
        modules,
        dependencies,
    });

    txb.transferObjects([cap], getActiveAddress());

    const results = await signAndExecute(txb, network, address);

    const packageId = results.objectChanges?.find(
        (x) => x.type === "published"
    )?.packageId;

    writeFileSync(
        `${exportFileName}.json`,
        JSON.stringify({
            packageId,
        }),
        {encoding: "utf8", flag: "w"}
    );

    const upgradeCap = results.objectChanges?.find(
        (change): change is Extract<SuiObjectChange, { type: 'created' }> =>
            change.type === "created" &&
            change.objectType.includes("::package::UpgradeCap")
    )?.objectId as string;
    const client = await getClient(network);
    const upgradeCapObject = await waitForObject(client, upgradeCap, 5, 500);
    const publishedPackageId = (upgradeCapObject.data?.content as any).fields.package;
    return results;
};

async function waitForObject(
    client: SuiClient,
    objectId: string,
    maxRetries = 10,
    delayMs = 500
): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const obj = await client.getObject({
                id: objectId,
                options: {showContent: true, showOwner: true},
            });
            if (obj?.error?.code === "notExists") {
                await new Promise((r) => setTimeout(r, delayMs));
                continue;
            }
            return obj;
        } catch (err: any) {
            if (err?.error?.code === "notExists") {
                await new Promise((r) => setTimeout(r, delayMs));
                continue;
            } else {
                throw err;
            }
        }
    }
    throw new Error(`Object ${objectId} did not become available in time.`);
}

function generateCoinModule(template: string, replacements: { [key: string]: string }): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
        return replacements[key] || `{${key}}`;
    });
}

export function generateToMoveFile(
    inputPath: string,
    outputPath: string,
    replacements: { [key: string]: string }
) {
    try {
        const template = fs.readFileSync(inputPath, 'utf-8');
        const result = generateCoinModule(template, replacements);

        fs.writeFileSync(outputPath, result, 'utf-8');
        console.log(`✅ Module written to ${outputPath}`);
        console.log(`✅ Module content: ${result}`);
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

export function deleteFile(moveFilePath: string) {
    try {
        fs.unlinkSync(moveFilePath);
        console.log(`✅ Deleted ${moveFilePath}`);
    } catch (error) {
        console.error(`❌ Error deleting ${moveFilePath}:`, error);
    }
}

export async function getModuleName(objectId: string, network: Network) {
    const obj = await getClient(network).getObject({
        id: objectId,
        options: {showType: true},
    });

    const objectType = obj.data?.type;
    if (!objectType) throw new Error("Object type not found");

    const match = objectType.match(/<([^>]+)>/);
    const innerType = match?.[1];
    if (!innerType) throw new Error("Inner coin type not found");

    const [, moduleName, structName] = innerType.split("::");
    return {moduleName, structName, fullType: innerType};
}

export async function getCoinsByType(address: string, type: string) {
    const client = new SuiClient({url: getFullnodeUrl(ACTIVE_NETWORK)});

    const response = await client.getCoins({
        owner: address,
        coinType: type,
    });

    return response.data;
}

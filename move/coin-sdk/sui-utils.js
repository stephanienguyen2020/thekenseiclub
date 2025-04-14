"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishPackage = exports.signAndExecute = exports.getClient = exports.getSigner = exports.getActiveAddress = exports.ACTIVE_NETWORK = exports.SUI_BIN = void 0;
exports.generateToMoveFile = generateToMoveFile;
exports.getModuleName = getModuleName;
exports.getCoinsByType = getCoinsByType;
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const fs_2 = require("fs");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const client_1 = require("@mysten/sui/client");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const transactions_1 = require("@mysten/sui/transactions");
const utils_1 = require("@mysten/sui/utils");
exports.SUI_BIN = `sui`;
exports.ACTIVE_NETWORK = process.env.NETWORK || "testnet";
const getActiveAddress = () => {
    return (0, child_process_1.execSync)(`${exports.SUI_BIN} client active-address`, {
        encoding: "utf8",
    }).trim();
};
exports.getActiveAddress = getActiveAddress;
const getSigner = (address) => {
    const sender = address;
    const keystore = JSON.parse((0, fs_2.readFileSync)(path_1.default.join((0, os_1.homedir)(), ".sui", "sui_config", "sui.keystore"), "utf8"));
    for (const priv of keystore) {
        const raw = (0, utils_1.fromBase64)(priv);
        if (raw[0] !== 0) {
            continue;
        }
        const pair = ed25519_1.Ed25519Keypair.fromSecretKey(raw.slice(1));
        if (pair.getPublicKey().toSuiAddress() === sender) {
            return pair;
        }
    }
    throw new Error(`keypair not found for sender: ${sender}`);
};
exports.getSigner = getSigner;
const getClient = (network) => {
    return new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)(network) });
};
exports.getClient = getClient;
const signAndExecute = async (txb, network, address) => {
    const signer = (0, exports.getSigner)(address); // chỉ gọi khi cần
    const client = (0, exports.getClient)(network);
    return client.signAndExecuteTransaction({
        transaction: txb,
        signer,
        options: {
            showEffects: true,
            showObjectChanges: true,
        },
    });
};
exports.signAndExecute = signAndExecute;
const publishPackage = async ({ packagePath, network, exportFileName = "contract", address }) => {
    const txb = new transactions_1.Transaction();
    const { modules, dependencies } = JSON.parse((0, child_process_1.execSync)(`${exports.SUI_BIN} move build --dump-bytecode-as-base64 --path ${packagePath}`, {
        encoding: "utf-8",
    }));
    const cap = txb.publish({
        modules,
        dependencies,
    });
    txb.transferObjects([cap], (0, exports.getActiveAddress)());
    const results = await (0, exports.signAndExecute)(txb, network, address);
    const packageId = results.objectChanges?.find((x) => x.type === "published")?.packageId;
    // save to an env file
    (0, fs_2.writeFileSync)(`${exportFileName}.json`, JSON.stringify({
        packageId,
    }), { encoding: "utf8", flag: "w" });
    const upgradeCap = results.objectChanges?.find((change) => change.type === "created" &&
        change.objectType.includes("::package::UpgradeCap"))?.objectId;
    const client = await (0, exports.getClient)(network);
    const upgradeCapObject = await waitForObject(client, upgradeCap, 5, 500);
    const publishedPackageId = (upgradeCapObject.data?.content).fields.package;
    return results;
};
exports.publishPackage = publishPackage;
async function waitForObject(client, objectId, maxRetries = 10, delayMs = 500) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const obj = await client.getObject({
                id: objectId,
                options: { showContent: true, showOwner: true },
            });
            if (obj?.error?.code === "notExists") {
                await new Promise((r) => setTimeout(r, delayMs));
                continue;
            }
            return obj;
        }
        catch (err) {
            if (err?.error?.code === "notExists") {
                await new Promise((r) => setTimeout(r, delayMs));
                continue;
            }
            else {
                throw err;
            }
        }
    }
    throw new Error(`Object ${objectId} did not become available in time.`);
}
function generateCoinModule(template, replacements) {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
        return replacements[key] || `{${key}}`; // giữ nguyên nếu không có key tương ứng
    });
}
function generateToMoveFile(inputPath, outputPath, replacements) {
    try {
        const template = fs_1.default.readFileSync(inputPath, 'utf-8');
        const result = generateCoinModule(template, replacements);
        fs_1.default.writeFileSync(outputPath, result, 'utf-8');
        console.log(`✅ Module written to ${outputPath}`);
        console.log(`✅ Module content: ${result}`);
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
}
async function getModuleName(objectId, network) {
    const obj = await (0, exports.getClient)(network).getObject({
        id: objectId,
        options: { showType: true },
    });
    const objectType = obj.data?.type;
    if (!objectType)
        throw new Error("Object type not found");
    // objectType format: 0x...::module::TreasuryCap<0x...::YourModule::YourCoin>
    const match = objectType.match(/<([^>]+)>/);
    const innerType = match?.[1];
    if (!innerType)
        throw new Error("Inner coin type not found");
    const [, moduleName, structName] = innerType.split("::");
    return { moduleName, structName, fullType: innerType };
}
async function getCoinsByType(address, type) {
    const signer = (0, exports.getSigner)(address);
    const client = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)(exports.ACTIVE_NETWORK) });
    const response = await client.getCoins({
        owner: address,
        coinType: type,
    });
    return response.data; // Mỗi item: { coinObjectId, balance, ... }
}
const isEmptyObject = (obj) => obj && Object.keys(obj).length === 0 && obj.constructor === Object;

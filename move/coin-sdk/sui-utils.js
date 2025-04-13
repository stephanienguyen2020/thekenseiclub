"use strict";
// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishPackage = exports.signAndExecute = exports.getClient = exports.getSigner = exports.getActiveAddress = exports.SUI_BIN = exports.ACTIVE_NETWORK = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const client_1 = require("@mysten/sui/client");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const transactions_1 = require("@mysten/sui/transactions");
const utils_1 = require("@mysten/sui/utils");
exports.ACTIVE_NETWORK = process.env.NETWORK || "testnet";
exports.SUI_BIN = `sui`;
const getActiveAddress = () => {
    return (0, child_process_1.execSync)(`${exports.SUI_BIN} client active-address`, {
        encoding: "utf8",
    }).trim();
};
exports.getActiveAddress = getActiveAddress;
/** Returns a signer based on the active address of system's sui. */
const getSigner = () => {
    const sender = (0, exports.getActiveAddress)();
    const keystore = JSON.parse((0, fs_1.readFileSync)(path_1.default.join((0, os_1.homedir)(), ".sui", "sui_config", "sui.keystore"), "utf8"));
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
/** Get the client for the specified network. */
const getClient = (network) => {
    return new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)(network) });
};
exports.getClient = getClient;
/** A helper to sign & execute a transaction. */
const signAndExecute = async (txb, network) => {
    const client = (0, exports.getClient)(network);
    const signer = (0, exports.getSigner)();
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
/** Publishes a package and saves the package id to a specified json file. */
const publishPackage = async ({ packagePath, network, exportFileName = "contract", }) => {
    const txb = new transactions_1.Transaction();
    const { modules, dependencies } = JSON.parse((0, child_process_1.execSync)(`${exports.SUI_BIN} move build --dump-bytecode-as-base64 --path ${packagePath}`, {
        encoding: "utf-8",
    }));
    const cap = txb.publish({
        modules,
        dependencies,
    });
    // Transfer the upgrade capability to the sender so they can upgrade the package later if they want.
    txb.transferObjects([cap], (0, exports.getActiveAddress)());
    const results = await (0, exports.signAndExecute)(txb, network);
    // @ts-ignore-next-line
    const packageId = results.objectChanges?.find((x) => x.type === "published")?.packageId;
    // save to an env file
    (0, fs_1.writeFileSync)(`${exportFileName}.json`, JSON.stringify({
        packageId,
    }), { encoding: "utf8", flag: "w" });
    return results;
};
exports.publishPackage = publishPackage;

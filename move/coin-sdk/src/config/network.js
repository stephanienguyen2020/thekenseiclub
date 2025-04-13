"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NETWORK_CONFIG = void 0;
exports.NETWORK_CONFIG = {
    mainnet: {
        url: "https://mainnet.example.com",
        options: {
            timeout: 30000,
            headers: {
                "Content-Type": "application/json",
            },
        },
    },
    testnet: {
        url: "https://testnet.example.com",
        options: {
            timeout: 30000,
            headers: {
                "Content-Type": "application/json",
            },
        },
    },
    local: {
        url: "http://localhost:8545",
        options: {
            timeout: 30000,
            headers: {
                "Content-Type": "application/json",
            },
        },
    },
};

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PINATA_API_SECRET = exports.PINATA_API_KEY = void 0;
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: __dirname + "/.env" });
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/asd";
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "https://mainnet.infura.io/v3/asd";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "lol";
const PINATA_API_KEY = process.env.PINATA_API_KEY || "api";
exports.PINATA_API_KEY = PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET || "secret";
exports.PINATA_API_SECRET = PINATA_API_SECRET;
const config = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            // // If you want to do some forking, uncomment this
            forking: {
                url: MAINNET_RPC_URL,
            },
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            //   accounts: {
            //     mnemonic: MNEMONIC,
            //   },
            saveDeployments: true,
            chainId: 11155111,
        },
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
        player: {
            default: 1,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.9",
            },
        ],
    },
    mocha: {
        timeout: 200000, // 200 seconds max for running tests
    },
};
exports.default = config;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMAGE_PATH = exports.UPLOAD_TO_IPFS = exports.IPFS_METADATA_HASH_LOCATION = exports.IPFS_IMAGE_HASH_LOCATION = exports.INITIAL_PRICE = exports.DECIMALS = exports.ADDRESS_LOCATION_FRONTEND = exports.ADDRESS_LOCATION = exports.developmentChains = exports.VERIFICATION_BLOCK_CONFIRMATIONS = exports.networkConfig = void 0;
const networkConfig = {
    default: {
        name: "hardhat",
        subscriptionId: undefined,
        vrfCoordinatorV2: undefined,
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        keepersUpdateInterval: "30",
        callbackGasLimit: "500000", // 500,000 gas
    },
    31337: {
        name: "localhost",
        subscriptionId: undefined,
        vrfCoordinatorV2: undefined,
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        keepersUpdateInterval: "30",
        callbackGasLimit: "500000", // 500,000 gas
    },
    11155111: {
        name: "sepolia",
        subscriptionId: "415",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        keepersUpdateInterval: "30",
        callbackGasLimit: "500000",
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    },
};
exports.networkConfig = networkConfig;
const DECIMALS = 8;
exports.DECIMALS = DECIMALS;
const INITIAL_PRICE = 3034715771688;
exports.INITIAL_PRICE = INITIAL_PRICE;
const ADDRESS_LOCATION = "./constants/addresses.json";
exports.ADDRESS_LOCATION = ADDRESS_LOCATION;
const ADDRESS_LOCATION_FRONTEND = "../soa-nft-marketplace-frontend/constants/addresses.json";
exports.ADDRESS_LOCATION_FRONTEND = ADDRESS_LOCATION_FRONTEND;
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
exports.VERIFICATION_BLOCK_CONFIRMATIONS = VERIFICATION_BLOCK_CONFIRMATIONS;
const developmentChains = ["hardhat", "localhost"];
exports.developmentChains = developmentChains;
const IPFS_IMAGE_HASH_LOCATION = "./constants/ipfs_image_hashes.json";
exports.IPFS_IMAGE_HASH_LOCATION = IPFS_IMAGE_HASH_LOCATION;
const IPFS_METADATA_HASH_LOCATION = "./constants/ipfs_metadata_hashes.json";
exports.IPFS_METADATA_HASH_LOCATION = IPFS_METADATA_HASH_LOCATION;
const IMAGE_PATH = "./images";
exports.IMAGE_PATH = IMAGE_PATH;
const UPLOAD_TO_IPFS = false;
exports.UPLOAD_TO_IPFS = UPLOAD_TO_IPFS;

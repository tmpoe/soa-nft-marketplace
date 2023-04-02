import { ethers } from "hardhat"

type ChainConfig = {
    name: "hardhat" | "localhost" | "sepolia" | "goerli" | "ganache"
    subscriptionId: string | undefined
    vrfCoordinatorV2: string | undefined
    gasLane: string
    keepersUpdateInterval: string
    callbackGasLimit: string
}

const default_config: ChainConfig = {
    name: "hardhat",
    subscriptionId: undefined,
    vrfCoordinatorV2: undefined,
    gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
    keepersUpdateInterval: "30",
    callbackGasLimit: "500000", // 500,000 gas
}

const ganache_config: ChainConfig = {
    name: "ganache",
    subscriptionId: undefined,
    vrfCoordinatorV2: undefined,
    gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
    keepersUpdateInterval: "30",
    callbackGasLimit: "500000", // 500,000 gas
}

const localhost_config: ChainConfig = {
    name: "localhost",
    subscriptionId: undefined,
    vrfCoordinatorV2: undefined,
    gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
    keepersUpdateInterval: "30",
    callbackGasLimit: "500000", // 500,000 gas
}

const sepolia_config: ChainConfig = {
    name: "sepolia",
    subscriptionId: "415",
    gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
    keepersUpdateInterval: "30",
    callbackGasLimit: "500000",
    vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
}

const goerli_config: ChainConfig = {
    name: "goerli",
    subscriptionId: "415",
    gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
    keepersUpdateInterval: "30",
    callbackGasLimit: "500000",
    vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
}

const networkConfig = {
    default: default_config,
    31337: localhost_config,
    11155111: sepolia_config,
    5: goerli_config,
    1337: ganache_config,
}
const DECIMALS = 8
const INITIAL_PRICE = 3034715771688
const ADDRESS_LOCATION: string = "./constants/addresses.json"
const ADDRESS_LOCATION_FRONTEND: string =
    "../soa-nft-marketplace-frontend/constants/addresses.json"
const VERIFICATION_BLOCK_CONFIRMATIONS = 6
const developmentChains = ["hardhat", "localhost", "ganache"]
const IPFS_IMAGE_HASH_LOCATION = "./constants/ipfs_image_hashes.json"
const FRONTEND_IPFS_IMAGE_HASH_LOCATION =
    "../soa-nft-marketplace-frontend/constants/ipfs_image_hashes.json"
const IPFS_METADATA_HASH_LOCATION = "./constants/ipfs_metadata_hashes.json"
const IMAGE_PATH = "./images"
const UPLOAD_TO_IPFS = false
const MINT_PRICE = ethers.utils.parseEther("0.01")
const DEPLOYER_ADDRESS = "0xC75444ef801b50f5601230db66F784e2078BE7Bb"

export {
    networkConfig,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    developmentChains,
    ADDRESS_LOCATION,
    ADDRESS_LOCATION_FRONTEND,
    DECIMALS,
    INITIAL_PRICE,
    IPFS_IMAGE_HASH_LOCATION,
    FRONTEND_IPFS_IMAGE_HASH_LOCATION,
    IPFS_METADATA_HASH_LOCATION,
    UPLOAD_TO_IPFS,
    IMAGE_PATH,
    ChainConfig,
    MINT_PRICE,
    DEPLOYER_ADDRESS,
}

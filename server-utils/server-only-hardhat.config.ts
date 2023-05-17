import type { HardhatUserConfig } from "hardhat/config"
import "@nomiclabs/hardhat-ethers"
import * as dotenv from "dotenv"
dotenv.config({ path: __dirname + "/.env" })

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/asd"
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://goerli.infura.io/v3/asd"
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "https://mainnet.infura.io/v3/asd"
const ARBITRUM_RPC_URL = process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc"
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "lol"
const PINATA_API_KEY = process.env.PINATA_API_KEY || "api"
const PINATA_API_SECRET = process.env.PINATA_API_SECRET || "secret"
const GANACHE_URL = process.env.GANACHE_URL || ""
const GANACHE_PRIVATE_KEY =
    process.env.GANACHE_PRIVATE_KEY !== undefined ? [process.env.GANACHE_PRIVATE_KEY] : []
const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            // // If you want to do some forking, uncomment this
            /* forking: {
                url: MAINNET_RPC_URL,
            }, */
            chainId: 31337,
        },
        localhost: {
            url: "http://0.0.0.0:8545/",
            chainId: 31337,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            //   accounts: {
            //     mnemonic: MNEMONIC,
            //   },
            chainId: 5,
        },
        ganache: {
            url: GANACHE_URL,
            accounts: GANACHE_PRIVATE_KEY,
            chainId: 1337,
            gas: 2100000,
            gasPrice: 8000000000,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            //   accounts: {
            //     mnemonic: MNEMONIC,
            //   },
            chainId: 11155111,
        },
    },
}
export default config

export { PINATA_API_KEY, PINATA_API_SECRET, PRIVATE_KEY }

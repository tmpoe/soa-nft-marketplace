import type { HardhatUserConfig } from "hardhat/config"
import "@nomiclabs/hardhat-ethers"
import * as dotenv from "dotenv"
dotenv.config({ path: __dirname + "/.env" })

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/asd"
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "https://mainnet.infura.io/v3/asd"
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PINATA_API_KEY = process.env.PINATA_API_KEY || "api"
const PINATA_API_SECRET = process.env.PINATA_API_SECRET || "secret"
const MNEMONIC = process.env.MNEMONIC || "mnemonic"
const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            chainId: 11155111,
        },
    },
}
export default config

export { PINATA_API_KEY, PINATA_API_SECRET, PRIVATE_KEY }

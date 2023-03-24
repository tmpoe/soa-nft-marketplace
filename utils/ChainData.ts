import { ADDRESS_LOCATION } from "../helper-hardhat-config"
import fs from "fs"
import { Chain } from "../types/adresses"

class ChainData {
    hardhat: Chain
    localhost: Chain
    sepolia: Chain

    constructor() {
        const contractAddresses = JSON.parse(fs.readFileSync(ADDRESS_LOCATION, "utf8"))
        this.localhost = contractAddresses[31337]
        this.sepolia = contractAddresses[11155111]
        this.hardhat = contractAddresses[10000]
    }
}

export default ChainData

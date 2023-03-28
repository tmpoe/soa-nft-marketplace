import { ADDRESS_LOCATION } from "../helper-hardhat-config"
import fs from "fs"

class DeployedContractAddresses {
    addresses: Array<string>

    constructor(addresses: Array<string>) {
        this.addresses = addresses
    }

    getLatestAddress(): string {
        return this.addresses.at(-1)!
    }
}

class ChainData {
    hardhat: DeployedContractAddresses
    localhost: DeployedContractAddresses
    sepolia: DeployedContractAddresses

    constructor() {
        const contractAddresses = JSON.parse(fs.readFileSync(ADDRESS_LOCATION, "utf8"))
        this.localhost = contractAddresses[31337]
        this.sepolia = contractAddresses[11155111]
        this.hardhat = contractAddresses[10000]
    }
}

export default ChainData

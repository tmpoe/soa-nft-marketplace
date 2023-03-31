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

class DeployedContracts {
    nftCatAttributes: DeployedContractAddresses
    nftMarketplace: DeployedContractAddresses
    nft: DeployedContractAddresses

    constructor(contractAddresses: any) {
        this.nftCatAttributes = contractAddresses["NftCatAttributes"]
        this.nftMarketplace = contractAddresses["NftMarketplace"]
        this.nft = contractAddresses["Nft"]
    }
}

class ChainData {
    hardhat: DeployedContracts
    localhost: DeployedContracts
    sepolia: DeployedContracts
    goerli: DeployedContracts

    constructor() {
        const contractAddresses = JSON.parse(fs.readFileSync(ADDRESS_LOCATION, "utf8"))
        this.localhost = contractAddresses[31337]
        this.sepolia = contractAddresses[11155111]
        this.hardhat = contractAddresses[10000]
        this.goerli = contractAddresses[5]
    }
}

export default ChainData

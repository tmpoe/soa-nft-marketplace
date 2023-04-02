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
    NftCatAttributes: DeployedContractAddresses
    NftMarketplace: DeployedContractAddresses
    Nft: DeployedContractAddresses

    constructor(contractAddresses: any) {
        this.NftCatAttributes = new DeployedContractAddresses(
            contractAddresses["NftCatAttributes"]
        )
        this.NftMarketplace = new DeployedContractAddresses(contractAddresses["NftMarketplace"])
        this.Nft = new DeployedContractAddresses(contractAddresses["Nft"])
    }
}

class ChainData {
    hardhat: DeployedContracts
    localhost: DeployedContracts
    sepolia: DeployedContracts
    goerli: DeployedContracts
    ganache: DeployedContracts

    constructor() {
        const contractAddresses = JSON.parse(fs.readFileSync(ADDRESS_LOCATION, "utf8"))
        this.localhost = new DeployedContracts(contractAddresses[31337])
        this.sepolia = new DeployedContracts(contractAddresses[11155111])
        this.hardhat = new DeployedContracts(contractAddresses[10000])
        this.goerli = new DeployedContracts(contractAddresses[5])
        this.ganache = new DeployedContracts(contractAddresses[1337])
    }
}

export default ChainData

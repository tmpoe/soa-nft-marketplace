const hre = require("hardhat")
const fs = require("fs")
import { addressLocations } from "../helper-hardhat-config"

async function updateContractAddress(contractName: string) {
    const chainId = hre.network.config.chainId.toString()
    const nftMarketplace = await hre.ethers.getContract(contractName)
    const contractAddresses = JSON.parse(fs.readFileSync(addressLocations, "utf8"))
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId][contractName].includes(nftMarketplace.address)) {
            contractAddresses[chainId][contractName].push(nftMarketplace.address)
        }
    } else {
        contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] }
    }
    fs.writeFileSync(addressLocations, JSON.stringify(contractAddresses))
}

export { updateContractAddress }

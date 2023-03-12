const hre = require("hardhat")
const fs = require("fs")
import { addressLocations } from "../helper-hardhat-config"

async function updateContractAddress(contractName: string, contractAddress: string) {
    const chainId = hre.network.config.chainId.toString()
    const contractAddresses = JSON.parse(fs.readFileSync(addressLocations, "utf8"))
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId][contractName]) {
            contractAddresses[chainId] = {
                [contractName]: [contractAddress],
                ...contractAddresses[chainId],
            }
        } else if (!contractAddresses[chainId][contractName].includes(contractAddress)) {
            contractAddresses[chainId][contractName].push(contractAddress)
        }
    } else {
        contractAddresses[chainId] = {
            [contractName]: [contractAddress],
        }
    }
    fs.writeFileSync(addressLocations, JSON.stringify(contractAddresses))
}

export { updateContractAddress }

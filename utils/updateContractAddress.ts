const hre = require("hardhat")
const fs = require("fs")
import { ADDRESS_LOCATION } from "../helper-hardhat-config"

async function updateContractAddress(contractName: string, contractAddress: string) {
    const chainId = hre.network.config.chainId.toString()
    const locationsToWriteTo = [ADDRESS_LOCATION]

    locationsToWriteTo.forEach(function (location) {
        console.log(location)
        const contractAddresses = JSON.parse(fs.readFileSync(location, "utf8"))
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
        fs.writeFileSync(location, JSON.stringify(contractAddresses))
    })
}

export { updateContractAddress }

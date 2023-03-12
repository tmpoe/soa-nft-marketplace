import { network } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
const { networkConfig, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")
const fs = require("fs")
import { addressLocations } from "../helper-hardhat-config"
import { updateContractAddress } from "../utils/updateContractAddress"

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { deploy, log } = hre.deployments
    const { deployer } = await hre.getNamedAccounts()

    const waitBlockConfirmations = VERIFICATION_BLOCK_CONFIRMATIONS
    const { getChainId } = hre
    const chainId = await getChainId()

    const contractAddresses = JSON.parse(fs.readFileSync(addressLocations, "utf8"))
    const nativeNftAddress = contractAddresses[chainId]["Nft"].at(-1)
    console.log(nativeNftAddress)
    log("----------------------------------------------------")

    let args = [
        "10000",
        networkConfig[chainId].subscriptionId,
        networkConfig[chainId].vrfCoordinatorV2,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        nativeNftAddress,
    ]

    const nftMarketplace = await deploy("NftMarketplace", {
        args: args,
        from: deployer,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    log("----------------------------------------------------")
    updateContractAddress("NftMarketplace")
}

module.exports.tags = ["all", "nftMarketplace"]

import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config"
const fs = require("fs")
import { ADDRESS_LOCATION } from "../helper-hardhat-config"
import { updateContractAddress } from "../utils/updateContractAddress"
import { verify } from "../utils/verify"

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { deploy, log } = hre.deployments
    const { network, getChainId } = hre
    const { deployer } = await hre.getNamedAccounts()

    const waitBlockConfirmations = !developmentChains.includes(network.name)
        ? VERIFICATION_BLOCK_CONFIRMATIONS
        : 1
    const chainId = await getChainId()

    const contractAddresses = JSON.parse(fs.readFileSync(ADDRESS_LOCATION, "utf8"))
    const nftMarketplace = contractAddresses[chainId]["NftMarketplace"].at(-1)

    log("----------------------------------------------------")
    log(`Deploying FeeGatekeeper on ${network.name}/${chainId}`)
    let args = [nftMarketplace, "10000"]

    const feeGatekeeper = await deploy("FeeGatekeeper", {
        args: args,
        from: deployer,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    log("----------------------------------------------------")
    updateContractAddress("FeeGatekeeper", feeGatekeeper.address)
    if (!developmentChains.includes(networkConfig[chainId as keyof typeof networkConfig].name)) {
        await verify(feeGatekeeper.address, args)
    }
}

module.exports.tags = ["all", "FeeGatekeeper"]

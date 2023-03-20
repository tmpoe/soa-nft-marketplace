import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
    developmentChains,
    networkConfig,
    UPLOAD_TO_IPFS,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config"
import { updateContractAddress } from "../utils/updateContractAddress"
import { verify } from "../utils/verify"
import { uploadImagesToIPFS } from "../utils/pinToPinata"

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { deploy, log } = hre.deployments
    const { network, getChainId } = hre
    const { deployer } = await hre.getNamedAccounts()
    const chainId = await getChainId()

    const waitBlockConfirmations = !developmentChains.includes(network.name)
        ? VERIFICATION_BLOCK_CONFIRMATIONS
        : 1

    if (UPLOAD_TO_IPFS) {
        uploadImagesToIPFS()
    }

    log("----------------------------------------------------")
    log(`Deploying Nft on ${network.name}/${chainId}`)

    const nft = await deploy("Nft", {
        args: [],
        from: deployer,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    log("----------------------------------------------------")
    updateContractAddress("Nft", nft.address)

    if (!developmentChains.includes(networkConfig[chainId as keyof typeof networkConfig].name)) {
        await verify(nft.address, [])
    }
}

module.exports.tags = ["all", "nft"]

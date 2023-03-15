import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
    developmentChains,
    networkConfig,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config"
import { updateContractAddress } from "../utils/updateContractAddress"
import { verify } from "../utils/verify"

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { deploy, log } = hre.deployments
    const { network, getChainId } = hre
    const { deployer } = await hre.getNamedAccounts()
    const chainId = await getChainId()

    const waitBlockConfirmations = !developmentChains.includes(network.name)
        ? VERIFICATION_BLOCK_CONFIRMATIONS
        : 1

    log("----------------------------------------------------")
    log(`Deploying Nft on ${network.name}/${chainId}`)

    let args: Array<Array<string>> = [
        [
            "ipfs://QmZjgbNwQLFmbvoKdBRUjYZSGGY1dnuZCzYDg34Vk79vRs",
            "ipfs://QmadRJjCCH55pm9xhkA3VGhMDhNspnjxoZGxifjEivdQua",
            "ipfs://QmUCTXYXeL56J3vYmaTSNvgPAE3HuBZk3tLM8AeNPeJHkF",
        ],
    ]
    const nft = await deploy("Nft", {
        args: args,
        from: deployer,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    log("----------------------------------------------------")
    updateContractAddress("Nft", nft.address)

    if (!developmentChains.includes(networkConfig[chainId as keyof typeof networkConfig].name)) {
        await verify(nft.address, args)
    }
}

module.exports.tags = ["all", "nft"]

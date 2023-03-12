import { ethers } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } from "../helper-hardhat-config"
import { updateContractAddress } from "../utils/updateContractAddress"

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { deploy, log } = hre.deployments
    const { deployer } = await hre.getNamedAccounts()

    const waitBlockConfirmations = VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")

    let args: Array<Array<string>> = [
        [
            "https://ipfs.io/ipfs/QmZjgbNwQLFmbvoKdBRUjYZSGGY1dnuZCzYDg34Vk79vRs",
            "https://ipfs.io/ipfs/QmadRJjCCH55pm9xhkA3VGhMDhNspnjxoZGxifjEivdQua",
            "https://ipfs.io/ipfs/QmUCTXYXeL56J3vYmaTSNvgPAE3HuBZk3tLM8AeNPeJHkF",
        ],
    ]

    const nft = await deploy("Nft", {
        args: args,
        from: deployer,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    log("----------------------------------------------------")
    updateContractAddress("Nft")
}

module.exports.tags = ["all", "nft"]

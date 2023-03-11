import { ethers } from "hardhat"
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const waitBlockConfirmations = VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")

    args = [
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

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(nft, args)
    }
    log("----------------------------------------------------")
}

module.exports.tags = ["all", "nft"]

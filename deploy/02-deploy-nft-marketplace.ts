import { ethers } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
const {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config")
const fs = require("fs")
import { ADDRESS_LOCATION } from "../helper-hardhat-config"
import { updateContractAddress } from "../utils/updateContractAddress"
import { verify } from "../utils/verify"

const FUND_AMOUNT = "1000000000000000000000"

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { deploy, log } = hre.deployments
    const { network, getChainId } = hre
    const { deployer } = await hre.getNamedAccounts()

    const waitBlockConfirmations = !developmentChains.includes(network.name)
        ? VERIFICATION_BLOCK_CONFIRMATIONS
        : 1
    const chainId = await getChainId()

    const contractAddresses = JSON.parse(fs.readFileSync(ADDRESS_LOCATION, "utf8"))
    const nativeNftAddress = contractAddresses[chainId]["Nft"].at(-1)

    let vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
    let subscriptionId = networkConfig[chainId].subscriptionId

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait()
        subscriptionId = transactionReceipt.events[0].args.subId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    }

    log("----------------------------------------------------")
    log(`Deploying NftMarketplace on ${network.name}/${chainId}`)
    let args = [
        nativeNftAddress,
        "10000",
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
    ]

    const nftMarketplace = await deploy("NftMarketplace", {
        args: args,
        from: deployer,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    log("----------------------------------------------------")
    updateContractAddress("NftMarketplace", nftMarketplace.address)
    if (!developmentChains.includes(networkConfig[chainId].name)) {
        await verify(nftMarketplace.address, args)
    }
}

module.exports.tags = ["all", "nftMarketplace"]

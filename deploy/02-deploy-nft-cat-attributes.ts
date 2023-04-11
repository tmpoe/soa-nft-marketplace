import { deployments, ethers } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { updateContractAddress } from "../utils/updateContractAddress"
import { verify } from "../utils/verify"
import {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config"
import { DeployFunction } from "hardhat-deploy/types"

const FUND_AMOUNT = "1000000000000000000000"

const deployNftCatAttributes: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deploy, log } = hre.deployments
    const { network, getChainId } = hre
    const { deployer } = await hre.getNamedAccounts()

    const waitBlockConfirmations = !developmentChains.includes(network.name)
        ? VERIFICATION_BLOCK_CONFIRMATIONS
        : 1

    const chainId = await getChainId()

    let vrfCoordinatorV2Address =
        networkConfig[chainId as keyof typeof networkConfig].vrfCoordinatorV2
    let subscriptionId = networkConfig[chainId as keyof typeof networkConfig].subscriptionId

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        console.debug("VRFCoordinatorV2Mock ", vrfCoordinatorV2Mock.address)
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait()
        subscriptionId = transactionReceipt.events[0].args.subId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    }

    log("----------------------------------------------------")
    log(`Deploying NftCatAttributes on ${network.name}/${chainId} from ${deployer}`)
    log(`Available funds ${await ethers.provider.getBalance(deployer)}`)

    const nftDeployment = await deployments.get("Nft")
    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId as keyof typeof networkConfig].gasLane,
        networkConfig[chainId as keyof typeof networkConfig].callbackGasLimit,
        nftDeployment.address,
    ]

    const catNftAttributes = await deploy("NftCatAttributes", {
        args: args,
        from: deployer,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, catNftAttributes.address)
    }

    log("----------------------------------------------------")
    updateContractAddress("NftCatAttributes", catNftAttributes.address)
    if (!developmentChains.includes(networkConfig[chainId as keyof typeof networkConfig].name)) {
        await verify(catNftAttributes.address, args)
    }
}
export default deployNftCatAttributes
deployNftCatAttributes.tags = ["all", "mocks", "main", "nftCatAttribute"]

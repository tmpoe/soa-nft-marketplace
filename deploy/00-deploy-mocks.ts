import { ethers } from "hardhat"
import { developmentChains } from "../helper-hardhat-config"
import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const BASE_FEE = "250000000000000000" // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas

const deployMocks: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network, getChainId } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = await getChainId()

    if (developmentChains.includes(network.name)) {
        log("----------------------------------------------------")
        log(`Deploying Mocks on ${network.name}/${chainId} from ${deployer}`)
        log(`Available funds ${await ethers.provider.getBalance(deployer)}`)
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        })
        log("----------------------------------------------------")
    }
}
export default deployMocks
deployMocks.tags = ["all", "mocks", "main"]

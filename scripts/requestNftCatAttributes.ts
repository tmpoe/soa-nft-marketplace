import { ethers, getNamedAccounts } from "hardhat"
import ChainData from "../utils/ChainData"
import { ChainConfig } from "../helper-hardhat-config"

async function requestNftCatAttributes(network: ChainConfig["name"]) {
    const chainData = new ChainData()
    const { deployer } = await getNamedAccounts()

    const nftCatAttributesAddress: string = chainData[network].NftCatAttributes.getLatestAddress()
    console.log(`Using nftCatAttributesAddress: ${nftCatAttributesAddress}`)
    const nftCatAttributes = await ethers.getContractAt(
        "NftCatAttributes",
        nftCatAttributesAddress
    )
    const tx = await nftCatAttributes.requestCatAttributes(deployer)

    const receipt = await tx.wait(1)
    console.log(JSON.stringify(receipt, null, 4))
}

requestNftCatAttributes("localhost")

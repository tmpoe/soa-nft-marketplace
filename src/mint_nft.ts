import { ethers, getChainId } from "hardhat"
import ChainData from "../utils/ChainData"
import { chainConfig, networkConfig } from "../helper-hardhat-config"

async function mintNft(address: string) {
    const chainId = await getChainId()
    const chainData = new ChainData()

    requestCatAttributes(chainData, chainId)
}

async function requestCatAttributes(chainData: ChainData, chainId: string) {
    const chain: chainConfig = networkConfig[chainId as keyof typeof networkConfig]
    const nftCatAttributeAddress = chainData[chain.name]
    const nftCatAttributes = await ethers.getContractAt("NftCatAttributes", nftCatAttributeAddress)

    await nftCatAttributes.requestCatAttributes()
    console.log("Cat attributes successfully requested")
}

export default mintNft

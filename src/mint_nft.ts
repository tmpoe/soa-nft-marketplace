import { ethers, getChainId } from "hardhat"
import ChainData from "../utils/ChainData"
import { ChainConfig, networkConfig, DEPLOYER_ADDRESS } from "../helper-hardhat-config"

async function mintNft(address: string) {
    const chainId = await getChainId()
    const chainData = new ChainData()
    const chain: ChainConfig = networkConfig[chainId as keyof typeof networkConfig]

    const nftMarketplaceAddress: string = chainData[chain.name].nftMarketplace.getLatestAddress()
    const nftMarketplace = await ethers.getContractAt("NftCatAttributes", nftMarketplaceAddress)

    const owner = requestCatAttributes(chainData, chain)
}

async function requestCatAttributes(chainData: ChainData, chain: ChainConfig) {
    const nftCatAttributeAddress: string =
        chainData[chain.name].nftCatAttributes.getLatestAddress()
    const nftCatAttributes = await ethers.getContractAt("NftCatAttributes", nftCatAttributeAddress)

    await nftCatAttributes.requestCatAttributes()
    console.log("Cat attributes successfully requested")
}

export default mintNft

import { ethers, getChainId } from "hardhat"
import ChainData from "../utils/ChainData"
import { ChainConfig, networkConfig } from "../helper-hardhat-config"
import { BigNumber } from "ethers"

async function mintNft(address: string) {
    const chainId = await getChainId()
    const chainData = new ChainData()
    const chain: ChainConfig = networkConfig[chainId as keyof typeof networkConfig]

    const nftMarketplaceAddress: string = chainData[chain.name].NftMarketplace.getLatestAddress()
    const nftMarketplace = await ethers.getContractAt("NftCatAttributes", nftMarketplaceAddress)

    requestCatAttributes(chainData, chain)
}

async function requestCatAttributes(chainData: ChainData, chain: ChainConfig) {
    const nftCatAttributeAddress: string =
        chainData[chain.name].NftCatAttributes.getLatestAddress()
    const nftCatAttributes = await ethers.getContractAt("NftCatAttributes", nftCatAttributeAddress)

    const tx = await nftCatAttributes.requestCatAttributes()
    const receipt = await tx.wait()
    try {
        const nftCatAttributesRequestedEvent = receipt.events[1]
        const requestId: BigNumber = nftCatAttributesRequestedEvent.args[0].toNumber()
        const requester: string = nftCatAttributesRequestedEvent.args[1]
    } catch (error) {
        console.log(error)
    }
}

export default mintNft

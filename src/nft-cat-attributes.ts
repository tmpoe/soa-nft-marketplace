import { NftCatAttributesCreated as eventSchema } from "../ref-nftmark-pet-proj/generated/schema"
import {
    NftCatAttributesCreated,
    NftCatAttributesRequested,
} from "../ref-nftmark-pet-proj/generated/NftCatAttributes/NftCatAttributes"
import { Bytes } from "@graphprotocol/graph-ts"
import { ethers, getNamedAccounts, getChainId } from "hardhat"
import ChainData from "../utils/ChainData"
import { ChainConfig, networkConfig } from "../helper-hardhat-config"

const toBytes = (text: string): Bytes => {
    const buffer = Buffer.from(text, "utf8")
    const result = Array(buffer.length)
    for (let i = 0; i < buffer.length; ++i) {
        result[i] = buffer[i]
    }
    return Bytes.fromI32(result)
}

// Usage example:
export function handleNftCatAttributesRequested(event: NftCatAttributesRequested) {
    console.log("TRIGGERED: NftCatAttributesRequested", event)
}
export async function handleNftCatAttributesCreated(event: NftCatAttributesCreated) {
    console.log("Triggered")
    const { deployer } = await getNamedAccounts()
    const chainData = new ChainData()

    const chainId = await getChainId()
    const chain: ChainConfig = networkConfig[chainId as keyof typeof networkConfig]

    const nftMarketplaceAddress = chainData[chain.name].NftMarketplace.getLatestAddress()
    const nftAddress = chainData[chain.name].Nft.getLatestAddress()

    const bytes = toBytes(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
    const nftCatAttributes = new eventSchema(bytes)

    const dummyAttr =
        nftCatAttributes.requester +
        "-" +
        nftCatAttributes.breed +
        "-" +
        nftCatAttributes.cuteness +
        "-" +
        nftCatAttributes.eyecolor

    const nftMarketplace = await ethers.getContractAt("NftMarketplace", nftMarketplaceAddress)
    const nft = await ethers.getContractAt("Nft", nftAddress)
    const tx = await nftMarketplace.mintNft(dummyAttr, deployer)

    const receipt = await tx.wait(1)
    const mintedEvent = receipt.events[1]
    const tokenId = mintedEvent.args[1].toNumber()

    console.log(tokenId)
    const t = await nft.tokenURI(tokenId)
    console.log(t)
}

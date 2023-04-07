import { ethers, getNamedAccounts } from "hardhat"
import ChainData from "../utils/ChainData"
import { ChainConfig } from "../helper-hardhat-config"

async function mintNft(network: ChainConfig["name"]) {
    const chainData = new ChainData()
    const { deployer } = await getNamedAccounts()

    const nftMarketplaceAddress = chainData[network].NftMarketplace.getLatestAddress()
    console.log(`Using nftMarketplace address: ${nftMarketplaceAddress}`)
    const nftMarketplace = await ethers.getContractAt("NftMarketplace", nftMarketplaceAddress)
    const newTokenIdTx = await nftMarketplace.mintNft("random", deployer)

    const newTokenIdReceipt = await newTokenIdTx.wait(1)

    console.log(JSON.stringify(newTokenIdReceipt, null, 4))
}

mintNft("localhost")

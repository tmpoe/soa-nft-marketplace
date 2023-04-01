import { ethers, getChainId, getNamedAccounts } from "hardhat"
import ChainData from "../utils/ChainData"
import { ChainConfig, networkConfig } from "../helper-hardhat-config"

async function mintNft(network: ChainConfig["name"]) {
    const chainData = new ChainData()
    const { deployer } = await getNamedAccounts()

    const nftMarketplaceAddress: string = chainData.ganache.NftMarketplace.getLatestAddress()
    const nftMarketplace = await ethers.getContractAt("NftMarketplace", nftMarketplaceAddress)
    await nftMarketplace.mintNft("random", deployer)
}

mintNft("ganache")

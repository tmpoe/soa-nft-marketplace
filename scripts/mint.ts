import { ethers, getChainId, getNamedAccounts } from "hardhat"
import ChainData from "../utils/ChainData"
import { ChainConfig, networkConfig } from "../helper-hardhat-config"

async function mintNft(network: ChainConfig["name"]) {
    const chainData = new ChainData()
    const { deployer } = await getNamedAccounts()

    const nftMarketplaceAddress: string = chainData.ganache.NftMarketplace.getLatestAddress()
    const nftMarketplace = await ethers.getContractAt("NftMarketplace", nftMarketplaceAddress)
    const newTokenIdTx = await nftMarketplace.mintNft("random", deployer)
    //console.log(JSON.stringify(newTokenIdTx, null, 4))

    const newTokenIdReceipt = await newTokenIdTx.wait(1)
    console.log(`New token created with id: ${newTokenIdReceipt.events[1].args[1]}`)

    console.log(JSON.stringify(newTokenIdReceipt.events[1].args[1], null, 4))
    console.log(JSON.stringify(newTokenIdReceipt.events, null, 4))
}

mintNft("ganache")

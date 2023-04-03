import { ethers, getNamedAccounts } from "hardhat"
import ChainData from "../utils/ChainData"
import { ChainConfig } from "../helper-hardhat-config"

async function requestNftCatAttributes(network: ChainConfig["name"]) {
    const chainData = new ChainData()
    const { deployer } = await getNamedAccounts()

    const nftCatAttributesAddress: string = chainData[network].NftCatAttributes.getLatestAddress()
    console.log(nftCatAttributesAddress)
    console.log(deployer)
    const nftCatAttributes = await ethers.getContractAt(
        "NftCatAttributes",
        nftCatAttributesAddress
    )
    const tx = await nftCatAttributes.requestCatAttributes(deployer)
    //console.log(JSON.stringify(newTokenIdTx, null, 4))

    const receipt = await tx.wait(1)
    //console.log(`Attributes requested: ${receipt.events[1].args[1]}`)

    //console.log(JSON.stringify(receipt.events[1].args[1], null, 4))
    console.log(JSON.stringify(receipt.events, null, 4))
}

requestNftCatAttributes("localhost")

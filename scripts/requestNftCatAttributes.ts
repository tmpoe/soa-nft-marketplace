import { ethers, getNamedAccounts } from "hardhat"
import ChainData from "../utils/ChainData"
import { ChainConfig } from "../helper-hardhat-config"

async function requestNftCatAttributes(network: ChainConfig["name"]) {
    const chainData = new ChainData()
    const { deployer } = await getNamedAccounts()

    const nftCatAttributesAddress: string = chainData.ganache.NftCatAttributes.getLatestAddress()
    console.log(nftCatAttributesAddress)
    console.log(deployer)
    const nftCatAttributes = await ethers.getContractAt(
        "NftCatAttributes",
        nftCatAttributesAddress
    )
    const asd = await nftCatAttributes.s_requestIdToSender(0)
    console.log(asd)
    const tx = await nftCatAttributes.requestCatAttributes(ethers.constants.AddressZero)
    //console.log(JSON.stringify(newTokenIdTx, null, 4))

    const receipt = await tx.wait(1)
    //console.log(`Attributes requested: ${receipt.events[1].args[1]}`)

    //console.log(JSON.stringify(receipt.events[1].args[1], null, 4))
    //console.log(JSON.stringify(receipt.events, null, 4))
}

requestNftCatAttributes("ganache")

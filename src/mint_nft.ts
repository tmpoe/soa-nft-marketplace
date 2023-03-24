import { ethers, getChainId } from "hardhat"
import { ADDRESS_LOCATION } from "../helper-hardhat-config"
import fs from "fs"

async function mintNft(address: string) {
    const chainId = await getChainId()

    const contractAddresses = JSON.parse(fs.readFileSync(ADDRESS_LOCATION, "utf8"))
    const nftCatAttributesAddress = contractAddresses[chainId]["NftCatAttributes"].at(-1)

    const nftCatAttributes = await ethers.getContractAt(
        "NftCatAttributes",
        nftCatAttributesAddress
    )

    await nftCatAttributes.requestCatAttributes()
    console.log("Cat attributes successfully requested")
}

export default mintNft

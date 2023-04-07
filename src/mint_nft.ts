import { ethers, getChainId } from "hardhat"
import ChainData from "../utils/ChainData"
import { ChainConfig, developmentChains, networkConfig } from "../helper-hardhat-config"
import { BigNumber, Contract } from "ethers"

async function mintNft(requester: string) {
    const chainId = await getChainId()
    const chainData = new ChainData()
    const chain: ChainConfig = networkConfig[chainId as keyof typeof networkConfig]

    const nftMarketplaceAddress: string = chainData[chain.name].NftMarketplace.getLatestAddress()
    const nftMarketplace = await ethers.getContractAt("NftMarketplace", nftMarketplaceAddress)
    const nftCatAttributeAddress: string =
        chainData[chain.name].NftCatAttributes.getLatestAddress()
    const nftCatAttributes = await ethers.getContractAt("NftCatAttributes", nftCatAttributeAddress)

    await new Promise<void>(async (resolve, reject) => {
        nftCatAttributes.once(
            "NftCatAttributesCreated",
            async (requestId, owner, breed, color, playfulness, cuteness, event) => {
                console.log("triggered")
                try {
                    const jumbledUpAttributes = `${requestId.toString()}_${owner}_${breed}_${color}_${playfulness.toString()}_${cuteness.toString()}`
                    console.log(owner)
                    const tx = await nftMarketplace.mintNft(jumbledUpAttributes, owner)
                    const rec = await tx.wait()
                    console.log(rec)
                    resolve()
                } catch (e) {
                    console.log(e)
                    reject(e)
                }
            }
        )
        try {
            await requestCatAttributes(nftCatAttributes, chainData, chain, requester)
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}

async function requestCatAttributes(
    nftCatAttributes: Contract,
    chainData: ChainData,
    chain: ChainConfig,
    requester: string
) {
    const tx = await nftCatAttributes.requestCatAttributes(requester)
    const receipt = await tx.wait()
    console.log(receipt)
    try {
        const nftCatAttributesRequestedEvent = receipt.events[1]
        const requestId: BigNumber = nftCatAttributesRequestedEvent.args[0].toNumber()
        const requester: string = nftCatAttributesRequestedEvent.args[1]
        console.log(requestId, requester)
        if (developmentChains.includes(chain.name)) {
            const vrfCoordinatorV2MockAddress: string =
                chainData[chain.name].VRFCoordinatorV2Mock.getLatestAddress()
            console.log(vrfCoordinatorV2MockAddress)
            const vrfCoordinatorV2Mock = await ethers.getContractAt(
                "VRFCoordinatorV2Mock",
                vrfCoordinatorV2MockAddress
            )
            const mockTx = await vrfCoordinatorV2Mock.fulfillRandomWords(
                receipt.events![1].args!.requestId,
                nftCatAttributesRequestedEvent.address
            )
            const mockRec = await mockTx.wait()
            console.log(mockRec)
        }
    } catch (error) {
        console.log(error)
    }
}

export default mintNft

mintNft("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

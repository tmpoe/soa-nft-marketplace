import { ethers, getChainId } from "hardhat"
import ChainData from "../utils/ChainData"
import { ChainConfig, developmentChains, networkConfig } from "../helper-hardhat-config"
import { BigNumber, Contract } from "ethers"
import { pinMetadataToPinata } from "../utils/pinToPinata"
import { attribute, tokenMetadata } from "../types/token"
import { BREED, EYE_COLOR, IPFS_IMAGE_HASH_LOCATIONS } from "../cat-mapping"
import NftCatAttributes from "../artifacts/contracts/NftCatAttributes.sol/NftCatAttributes.json"
import NftMarketplace from "../artifacts/contracts/NftMarketplace.sol/NftMarketplace.json"

async function mintNft(requester: string) {
    const chainId = await getChainId()
    console.log("chainId", chainId)
    const chainData = new ChainData()
    const chain: ChainConfig = networkConfig[chainId as keyof typeof networkConfig]

    const nftMarketplaceAddress: string = chainData[chain.name].NftMarketplace.getLatestAddress()
    console.debug("nftMarketplaceAddress", nftMarketplaceAddress)
    const nftMarketplace = await ethers.getContractAt(NftMarketplace.abi, nftMarketplaceAddress)
    const nftCatAttributeAddress: string =
        chainData[chain.name].NftCatAttributes.getLatestAddress()
    console.debug("nftCatAttributeAddress", nftCatAttributeAddress)
    const nftCatAttributes = await ethers.getContractAt(
        NftCatAttributes.abi,
        nftCatAttributeAddress
    )

    await new Promise<void>(async (resolve, reject) => {
        nftCatAttributes.once(
            "NftCatAttributesCreated",
            async (
                requestId: BigNumber,
                owner: string,
                breed: Number,
                color: Number,
                playfulness: BigNumber,
                cuteness: BigNumber,
                event
            ) => {
                try {
                    const breedName = BREED[breed as keyof typeof BREED]
                    const attributes: Array<attribute> = [
                        {
                            trait_type: "breed",
                            value: breedName,
                        },
                        { trait_type: "playfulness", value: playfulness.toString() },
                        {
                            trait_type: "eye_color",
                            value: EYE_COLOR[color as keyof typeof EYE_COLOR],
                        },
                        { trait_type: "cuteness", value: cuteness.toString() },
                    ]
                    const metadata: tokenMetadata = {
                        name: owner + "_" + requestId,
                        imageLocation:
                            IPFS_IMAGE_HASH_LOCATIONS[
                                breedName as keyof typeof IPFS_IMAGE_HASH_LOCATIONS
                            ],
                        attributes: attributes,
                    }
                    const response = await pinMetadataToPinata(metadata)
                    const tx = await nftMarketplace.mintNft(response.IpfsHash, owner)
                    const rec = await tx.wait()
                    console.debug(rec)
                    resolve()
                } catch (e) {
                    console.debug(e)
                    reject(e)
                }
            }
        )
        try {
            await requestCatAttributes(nftCatAttributes, chainData, chain, requester)
        } catch (error) {
            console.debug(error)
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
    console.debug(receipt)
    try {
        const nftCatAttributesRequestedEvent = receipt.events[1]

        if (developmentChains.includes(chain.name)) {
            const vrfCoordinatorV2MockAddress: string =
                chainData[chain.name].VRFCoordinatorV2Mock.getLatestAddress()
            const vrfCoordinatorV2Mock = await ethers.getContractAt(
                "VRFCoordinatorV2Mock",
                vrfCoordinatorV2MockAddress
            )
            const mockTx = await vrfCoordinatorV2Mock.fulfillRandomWords(
                receipt.events![1].args.requestId,
                nftCatAttributesRequestedEvent.address
            )
            const mockRec = await mockTx.wait()
            console.debug(mockRec)
        }
    } catch (error) {
        console.debug(error)
    }
}

export default mintNft

mintNft("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

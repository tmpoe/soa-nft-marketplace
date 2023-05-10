import { ethers } from "hardhat"
import ChainData from "../utils/ChainData"
import { ChainConfig, developmentChains, networkConfig } from "../helper-hardhat-config"
import { BigNumber, Contract } from "ethers"
import { pinMetadataToPinata } from "../utils/pinToPinata"
import { attribute, tokenMetadata } from "../types/token"
import { BREED, EYE_COLOR, IPFS_IMAGE_HASH_LOCATIONS } from "../cat-mapping"
import NftCatAttributes from "../artifacts/contracts/NftCatAttributes.sol/NftCatAttributes.json"
import NftMarketplace from "../artifacts/contracts/NftMarketplace.sol/NftMarketplace.json"
import { VRFCoordinatorV2Mock__factory } from "../typechain-types"
import { PRIVATE_KEY } from "../hardhat.config"

async function mintNft(requester: string, chainId: number) {
    console.log("chainId", chainId)
    const chainData = new ChainData()
    const chain: ChainConfig = networkConfig[chainId as keyof typeof networkConfig]

    let customHttpProvider = new ethers.providers.JsonRpcProvider(chain.rpc_url)
    let wallet = new ethers.Wallet(PRIVATE_KEY!, customHttpProvider)

    console.log("signer", wallet)

    const nftMarketplaceAddress: string = chainData[chain.name].NftMarketplace.getLatestAddress()
    const nftMarketplace = new ethers.Contract(nftMarketplaceAddress, NftMarketplace.abi, wallet)

    const nftCatAttributeAddress: string =
        chainData[chain.name].NftCatAttributes.getLatestAddress()
    const nftCatAttributes = new ethers.Contract(
        nftCatAttributeAddress,
        NftCatAttributes.abi,
        wallet
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
                    console.log(rec)
                    resolve()
                } catch (e) {
                    console.log(e)
                    reject(e)
                }
            }
        )
        try {
            console.log("Requesting cat attributes")
            await requestCatAttributes(nftCatAttributes, chainData, chain, requester)
        } catch (error) {
            console.error(error)
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
    console.log("post-request")
    const receipt = await tx.wait()
    console.log(receipt)
    try {
        const nftCatAttributesRequestedEvent = receipt.events[1]

        if (developmentChains.includes(chain.name)) {
            const provider = new ethers.providers.JsonRpcProvider(chain.rpc_url)
            const signer = provider.getSigner()
            const vrfCoordinatorV2MockAddress: string =
                chainData[chain.name].VRFCoordinatorV2Mock.getLatestAddress()
            const vrfCoordinatorV2Mock = await VRFCoordinatorV2Mock__factory.connect(
                vrfCoordinatorV2MockAddress,
                signer
            )
            const mockTx = await vrfCoordinatorV2Mock.fulfillRandomWords(
                receipt.events![1].args.requestId,
                nftCatAttributesRequestedEvent.address
            )
            const mockRec = await mockTx.wait()
            console.log(mockRec)
        }
    } catch (error) {
        console.error(error)
    }
}

export default mintNft

//mintNft("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

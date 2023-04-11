import { ethers, getChainId } from "hardhat"
import ChainData from "../utils/ChainData"
import { ChainConfig, developmentChains, networkConfig } from "../helper-hardhat-config"
import { BigNumber, Contract } from "ethers"
import { pinMetadataToPinata } from "../utils/pinToPinata"
import { attribute, tokenMetadata } from "../types/token"
import { BREED, EYE_COLOR, IPFS_IMAGE_HASH_LOCATIONS } from "../cat-mapping"
import NftCatAttributes from "../artifacts/contracts/NftCatAttributes.sol/NftCatAttributes.json"
import NftMarketplace from "../artifacts/contracts/NftMarketplace.sol/NftMarketplace.json"
import { ERC721__factory, VRFCoordinatorV2Mock__factory } from "../typechain-types"

async function mintNft(requester: string) {
    const chainId = await getChainId()
    console.debug("chainId", chainId)
    const chainData = new ChainData()
    const chain: ChainConfig = networkConfig[chainId as keyof typeof networkConfig]
    console.debug("chain", chain)

    let customHttpProvider = new ethers.providers.JsonRpcProvider(chain.rpc_url)
    const signer = customHttpProvider.getSigner()
    console.debug("customHttpProvider", customHttpProvider)
    console.debug("blocknumber ", await customHttpProvider.getBlockNumber())

    const nftMarketplaceAddress: string = chainData[chain.name].NftMarketplace.getLatestAddress()
    console.debug("nftMarketplaceAddress", nftMarketplaceAddress)
    const nftMarketplace = new ethers.Contract(nftMarketplaceAddress, NftMarketplace.abi, signer)

    const nftCatAttributeAddress: string =
        chainData[chain.name].NftCatAttributes.getLatestAddress()
    console.debug("nftCatAttributeAddress", nftCatAttributeAddress)
    const nftCatAttributes = new ethers.Contract(
        nftCatAttributeAddress,
        NftCatAttributes.abi,
        signer
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
        const provider = new ethers.providers.JsonRpcProvider(chain.rpc_url)
        const signer = provider.getSigner()

        if (developmentChains.includes(chain.name)) {
            const vrfCoordinatorV2MockAddress: string =
                chainData[chain.name].VRFCoordinatorV2Mock.getLatestAddress()
            const vrfCoordinatorV2Mock = VRFCoordinatorV2Mock__factory.connect(
                vrfCoordinatorV2MockAddress,
                signer
            )
            const mockTx = await vrfCoordinatorV2Mock.fulfillRandomWords(
                receipt.events![1].args.requestId,
                nftCatAttributesRequestedEvent.address
            )
            const mockRec = await mockTx.wait()
            console.debug(mockRec)

            const nftAddress = chainData[chain.name].Nft.getLatestAddress()
            const nft = ERC721__factory.connect(nftAddress, provider)

            console.log(await nft.balanceOf(requester))
        }
    } catch (error) {
        console.debug(error)
    }
}

export default mintNft

mintNft("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

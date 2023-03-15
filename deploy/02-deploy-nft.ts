import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
    developmentChains,
    networkConfig,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    UPLOAD_TO_IPFS,
    IPFS_IMAGE_HASH_LOCATION,
    IPFS_METADATA_HASH_LOCATION,
} from "../helper-hardhat-config"
import { updateContractAddress } from "../utils/updateContractAddress"
import { verify } from "../utils/verify"
import { tokenMetadata } from "../types/token"
import { uploadImagesToIPFS, pinMetadataToPinata } from "../utils/pinToPinata"
import fs from "fs"

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { deploy, log } = hre.deployments
    const { network, getChainId } = hre
    const { deployer } = await hre.getNamedAccounts()
    const chainId = await getChainId()

    const waitBlockConfirmations = !developmentChains.includes(network.name)
        ? VERIFICATION_BLOCK_CONFIRMATIONS
        : 1

    if (UPLOAD_TO_IPFS) {
        const responses = await uploadImagesToIPFS()

        for (const index in responses) {
            if (!responses[index].IpfsHash) {
                throw Error("At least one of the ipfs uploads failed!")
            }
        }
    }
    let imageHashes = JSON.parse(fs.readFileSync(IPFS_IMAGE_HASH_LOCATION, "utf8"))

    if (UPLOAD_TO_IPFS) {
        for (const name in imageHashes) {
            const metadata: tokenMetadata = {
                name: name,
                imageLocation: imageHashes[name],
                description: "It is a cat",
                attributes: [
                    {
                        trait_type: "eye_color",
                        value: "blue",
                    },
                    {
                        trait_type: "playfulness",
                        value: 32,
                    },
                ],
            }
            const response = await pinMetadataToPinata(metadata)
            if (!response) {
                throw Error("Metadata upload failed!")
            }
        }
    }
    let tokenMetadataHashes: Array<string> = []
    const metadatas = JSON.parse(fs.readFileSync(IPFS_METADATA_HASH_LOCATION, "utf8"))
    for (const name in metadatas) {
        tokenMetadataHashes.push(metadatas[name])
    }
    log("----------------------------------------------------")
    log(`Deploying Nft on ${network.name}/${chainId}`)

    const nft = await deploy("Nft", {
        args: [],
        from: deployer,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    log("----------------------------------------------------")
    updateContractAddress("Nft", nft.address)

    if (!developmentChains.includes(networkConfig[chainId as keyof typeof networkConfig].name)) {
        await verify(nft.address, [])
    }
}

module.exports.tags = ["all", "nft"]

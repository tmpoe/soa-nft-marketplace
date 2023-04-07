import pinataSDK from "@pinata/sdk"
import { PINATA_API_KEY, PINATA_API_SECRET } from "../hardhat.config"
import {
    IPFS_IMAGE_HASH_LOCATION,
    FRONTEND_IPFS_IMAGE_HASH_LOCATION,
    IPFS_METADATA_HASH_LOCATION,
    IMAGE_PATH,
} from "../helper-hardhat-config"
import type { tokenMetadata } from "../types/token"
import fs from "fs"
import path from "path"

const pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET)

async function uploadImagesToIPFS() {
    const imagesPath = path.resolve(IMAGE_PATH)
    const images = fs.readdirSync(imagesPath)

    let responses = []
    for (const imageIndex in images) {
        const image = images[imageIndex]
        const readableStreamForImage = fs.createReadStream(`${imagesPath}/${image}`)
        try {
            console.debug("**********************")
            console.debug("Uploading image to IPFS")

            const imageExtension = path.extname(image)
            if (![".png", ".svg", ".jpg"].includes(imageExtension)) {
                console.debug(`Trying to update non image extension: ${image}`)
                continue
            }
            const imageBaseName = path.basename(image, imageExtension)
            const response = await pinata.pinFileToIPFS(readableStreamForImage, {
                pinataMetadata: { name: imageBaseName },
            })
            saveIpfsHash(imageBaseName, response.IpfsHash, IPFS_IMAGE_HASH_LOCATION)
            saveIpfsHash(imageBaseName, response.IpfsHash, FRONTEND_IPFS_IMAGE_HASH_LOCATION)

            console.debug(`Upload successful: ${response.IpfsHash}`)
            console.debug("**********************")
            responses.push(response)
        } catch (error) {
            console.debug(error)
        }
    }
    return responses
}

function saveIpfsHash(name: string, hash: string, location: string) {
    let hashes = JSON.parse(fs.readFileSync(location, "utf8"))
    hashes = {
        [name]: hash,
        ...hashes,
    }
    fs.writeFileSync(location, JSON.stringify(hashes))
}

async function pinMetadataToPinata(metadata: tokenMetadata) {
    console.debug("**********************")
    console.debug("Uploading metadata to IPFS")

    const response = await pinata.pinJSONToIPFS(metadata, {
        pinataMetadata: { name: `${metadata.name}_metadata` },
    })
    saveIpfsHash(metadata.name, response.IpfsHash, IPFS_METADATA_HASH_LOCATION)

    console.debug(`Upload successful: ${response.IpfsHash}`)
    console.debug("**********************")

    return response
}

export { uploadImagesToIPFS, pinMetadataToPinata }

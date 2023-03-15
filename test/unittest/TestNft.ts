import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert } from "chai"
import { ethers } from "hardhat"
import { Contract } from "ethers"

describe("Nft minting tests", () => {
    let owner: SignerWithAddress, addr1: SignerWithAddress, nft, hardhatNft: Contract

    beforeEach(async () => {
        ;[owner, addr1] = await ethers.getSigners()

        nft = await ethers.getContractFactory("Nft")
        hardhatNft = await nft.deploy()
        await hardhatNft.deployed()
    })

    it("mints NFT after random number returned", async function () {
        const tx = await hardhatNft.mint(owner.address, "cat1")
        await tx.wait(1)

        const tokenId = tx.value
        assert.equal(await hardhatNft.ownerOf(tokenId.toString()), owner.address)
    })
})

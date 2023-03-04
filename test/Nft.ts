import { assert, expect } from "chai"
import { ethers } from "hardhat"

describe("Nft contract tests", () => {
    it("is mintable", async () => {
        const [owner] = await ethers.getSigners()

        const Nft = await ethers.getContractFactory("Nft")
        const hardhatNft = await Nft.deploy()
        await hardhatNft.deployed()

        await expect(hardhatNft.mint()).to.emit(hardhatNft, "NftMinted").withArgs(owner.address)
    })
})

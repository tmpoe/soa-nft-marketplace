import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { ethers } from "hardhat"
import { Nft } from "../typechain-types"

describe("Nft contract tests", () => {
    let owner: SignerWithAddress, nft, hardhatNft: Nft

    beforeEach(async () => {
        ;[owner] = await ethers.getSigners()

        nft = await ethers.getContractFactory("Nft")
        hardhatNft = await nft.deploy()
        await hardhatNft.deployed()
    })

    it("is mintable", async () => {
        await expect(hardhatNft.mint()).to.emit(hardhatNft, "NftMinted").withArgs(owner.address)
        const nftOwner = await hardhatNft.ownerOf(0)
        assert(nftOwner === owner.address)
    })
})

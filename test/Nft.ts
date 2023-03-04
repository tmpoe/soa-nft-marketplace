import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { ethers } from "hardhat"
import { Nft } from "../typechain-types"

describe("Nft minting tests", () => {
    let owner: SignerWithAddress, addr1: SignerWithAddress, nft, hardhatNft: Nft
    const firstIndex = 0
    const secondIndex = 1

    beforeEach(async () => {
        ;[owner, addr1] = await ethers.getSigners()

        nft = await ethers.getContractFactory("Nft")
        hardhatNft = await nft.deploy()
        await hardhatNft.deployed()
    })

    it("is mintable", async () => {
        await expect(hardhatNft.mint()).to.emit(hardhatNft, "NftMinted").withArgs(owner.address)
        const nftOwner = await hardhatNft.ownerOf(0)
        assert(nftOwner === owner.address)
    })

    it("allows anyone to mint", async () => {
        await expect(hardhatNft.mint()).to.emit(hardhatNft, "NftMinted").withArgs(owner.address)
        await expect(hardhatNft.connect(addr1).mint())
            .to.emit(hardhatNft, "NftMinted")
            .withArgs(addr1.address)
    })
})

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { ethers } from "hardhat"
import { Nft } from "../typechain-types"
import { BigNumber } from "ethers"

describe("Nft minting tests", () => {
    let owner: SignerWithAddress, addr1: SignerWithAddress, nft, hardhatNft: Nft
    const firstIndex = 0
    const secondIndex = 1

    beforeEach(async () => {
        ;[owner, addr1] = await ethers.getSigners()

        nft = await ethers.getContractFactory("Nft")
        hardhatNft = await nft.deploy(1)
        await hardhatNft.deployed()
    })

    it("is mintable", async () => {
        const fee: BigNumber = await hardhatNft.getMintingFee()
        await expect(hardhatNft.mint({ value: fee.toString() }))
            .to.emit(hardhatNft, "NftMinted")
            .withArgs(owner.address)
        const nftOwner = await hardhatNft.ownerOf(0)
        assert(nftOwner === owner.address)
    })

    it("allows anyone to mint", async () => {
        const fee: BigNumber = await hardhatNft.getMintingFee()
        await expect(hardhatNft.mint({ value: fee.toString() }))
            .to.emit(hardhatNft, "NftMinted")
            .withArgs(owner.address)
        await expect(hardhatNft.connect(addr1).mint({ value: fee.toString() }))
            .to.emit(hardhatNft, "NftMinted")
            .withArgs(addr1.address)
    })

    it("fails to mint in case of insufficient funds", async () => {
        await expect(hardhatNft.mint()).to.be.revertedWithCustomError(
            hardhatNft,
            "Nft__InsufficientFunds"
        )
    })
})

describe("Nft behaviour tests", () => {
    let owner: SignerWithAddress, addr1: SignerWithAddress, nft, hardhatNft: Nft
    const firstIndex = 0
    const secondIndex = 1

    beforeEach(async () => {
        ;[owner, addr1] = await ethers.getSigners()

        nft = await ethers.getContractFactory("Nft")
        hardhatNft = await nft.deploy(1)
        await hardhatNft.deployed()
        const fee: BigNumber = await hardhatNft.getMintingFee()
        await hardhatNft.mint({ value: fee.toString() })
    })

    it("can change owners", async () => {
        await hardhatNft.transferFrom(owner.address, addr1.address, 0)
        assert(addr1.address === (await hardhatNft.ownerOf(0)))
    })
})

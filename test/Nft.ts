import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { ethers } from "hardhat"
import { Nft } from "../typechain-types"
import { BigNumber } from "ethers"
import { token } from "../typechain-types/@openzeppelin/contracts"

describe("Nft minting tests", () => {
    let owner: SignerWithAddress, addr1: SignerWithAddress, nft, hardhatNft: Nft

    const firstIndex = 0
    const secondIndex = 1

    beforeEach(async () => {
        ;[owner, addr1] = await ethers.getSigners()

        nft = await ethers.getContractFactory("Nft")

        hardhatNft = await nft.deploy(["cat1", "cat2", "cat3"])
        await hardhatNft.deployed()
    })

    it("mints NFT after random number returned", async function () {
        const tx = await hardhatNft.mint(0, owner.address)
        await tx.wait(1)

        const tokenId = tx.value
        assert.equal(await hardhatNft.ownerOf(tokenId.toString()), owner.address)
    })
})

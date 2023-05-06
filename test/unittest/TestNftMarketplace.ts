import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { ethers } from "hardhat"
import { BigNumber, Contract } from "ethers"

const PRICE = ethers.utils.parseEther("0.1")

let owner: SignerWithAddress,
    addr1: SignerWithAddress,
    nft,
    hardhatNft: Contract,
    nftmarketplace,
    hardhatNftmarketplace: Contract

describe("Marketplace tests", () => {
    beforeEach(async () => {
        ;[owner, addr1] = await ethers.getSigners()

        nft = await ethers.getContractFactory("Nft")

        hardhatNft = await nft.deploy()
        await hardhatNft.deployed()

        nftmarketplace = await ethers.getContractFactory("NftMarketplace")
        hardhatNftmarketplace = await nftmarketplace.deploy(hardhatNft.address, 1)
        hardhatNftmarketplace.deployed()
    })

    it("is requestable to mint", async () => {
        const fee: BigNumber = await hardhatNftmarketplace.getMintingFee()

        await expect(hardhatNftmarketplace.mintNft("cat1", owner.address))
            .to.emit(hardhatNftmarketplace, "NftMinted")
            .withArgs(owner.address, 0, hardhatNft.address)
    })

    it("allows only the owner to request", async () => {
        const fee: BigNumber = await hardhatNftmarketplace.getMintingFee()
        await expect(hardhatNftmarketplace.mintNft("cat1", owner.address))
            .to.emit(hardhatNftmarketplace, "NftMinted")
            .withArgs(owner.address, 0, hardhatNft.address)
        await expect(
            hardhatNftmarketplace.connect(addr1).mintNft("cat2", addr1.address)
        ).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("fails to mint in case of insufficient funds", async () => {
        await expect(hardhatNftmarketplace.gatekeep()).to.be.revertedWithCustomError(
            hardhatNftmarketplace,
            "NftMarketplace__InsufficientFunds"
        )
    })
})

describe("Pre-existing Nft tests", () => {
    beforeEach(async () => {
        ;[owner, addr1] = await ethers.getSigners()

        nft = await ethers.getContractFactory("Nft")
        const gasLane = ethers.constants.HashZero
        hardhatNft = await nft.deploy()
        await hardhatNft.deployed()

        nftmarketplace = await ethers.getContractFactory("NftMarketplace")
        hardhatNftmarketplace = await nftmarketplace.deploy(hardhatNft.address, 1)
        await hardhatNftmarketplace.deployed()

        const fee = await hardhatNftmarketplace.getMintingFee()
        const mintNftResponse = await hardhatNftmarketplace.mintNft("cat1", owner.address)
        await mintNftResponse.wait(1)

        await hardhatNft.approve(hardhatNftmarketplace.address, 0)
        const tokenCounter = await hardhatNft.getTokenCounter()
        assert.equal(tokenCounter.toString(), "1")
        assert.isTrue((await hardhatNft.tokenURI(0)).includes("cat"))
        assert.equal(await hardhatNft.ownerOf(0), owner.address)
    })

    it("Facilitates listings", async () => {
        await expect(hardhatNftmarketplace.listNft(0, hardhatNft.address, PRICE))
            .to.emit(hardhatNftmarketplace, "NftListed")
            .withArgs(0, owner.address, PRICE, hardhatNft.address)
    })

    it("does not allow relisting", async () => {
        hardhatNftmarketplace.listNft(0, hardhatNft.address, PRICE)

        await expect(hardhatNftmarketplace.listNft(0, hardhatNft.address, PRICE))
            .to.be.revertedWithCustomError(
                hardhatNftmarketplace,
                "NftMarketplace__ItemAlreadyListed"
            )
            .withArgs(0, hardhatNft.address)
    })

    it("only allows nft owner to list", async () => {
        await expect(
            hardhatNftmarketplace.connect(addr1).listNft(0, hardhatNft.address, PRICE)
        ).to.be.revertedWithCustomError(hardhatNftmarketplace, "NftMarketplace__Unauthorized")
    })

    it("only allows to lift nfts with bigger than 0 price", async () => {
        await expect(
            hardhatNftmarketplace.listNft(0, hardhatNft.address, 0)
        ).to.be.revertedWithCustomError(
            hardhatNftmarketplace,
            "NftMarketplace__NoPriceSetForListing"
        )
    })

    it("allows to cancel listing", async () => {
        hardhatNftmarketplace.listNft(0, hardhatNft.address, PRICE)
        await expect(hardhatNftmarketplace.cancelListing(0, hardhatNft.address))
            .to.emit(hardhatNftmarketplace, "NftListingCancelled")
            .withArgs(0, owner.address, hardhatNft.address)
    })

    it("allows only owner to cancel listing", async () => {
        hardhatNftmarketplace.listNft(0, hardhatNft.address, PRICE)
        await expect(
            hardhatNftmarketplace.connect(addr1).cancelListing(0, hardhatNft.address)
        ).to.be.revertedWithCustomError(hardhatNftmarketplace, "NftMarketplace__Unauthorized")
    })

    it("doesn not allow to cancel non-existent listing", async () => {
        await expect(hardhatNftmarketplace.cancelListing(0, hardhatNft.address))
            .to.be.revertedWithCustomError(hardhatNftmarketplace, "NftMarketplace__ItemNotListed")
            .withArgs(0, hardhatNft.address)
    })

    it("allows to update the price of a listing", async () => {
        hardhatNftmarketplace.listNft(0, hardhatNft.address, PRICE)
        await expect(hardhatNftmarketplace.updateListing(0, hardhatNft.address, PRICE))
            .to.emit(hardhatNftmarketplace, "NftListingUpdated")
            .withArgs(0, owner.address, PRICE, hardhatNft.address)
    })

    it("allows only owner to update the price of a listing", async () => {
        hardhatNftmarketplace.listNft(0, hardhatNft.address, PRICE)
        await expect(
            hardhatNftmarketplace.connect(addr1).updateListing(0, hardhatNft.address, PRICE)
        ).to.be.revertedWithCustomError(hardhatNftmarketplace, "NftMarketplace__Unauthorized")
    })

    it("does not allow to update the price of a listing to zero or negative", async () => {
        hardhatNftmarketplace.listNft(0, hardhatNft.address, PRICE)
        await expect(
            hardhatNftmarketplace.updateListing(0, hardhatNft.address, 0)
        ).to.be.revertedWithCustomError(
            hardhatNftmarketplace,
            "NftMarketplace__NoPriceSetForListing"
        )
    })

    it("allows to buy listed nft items", async () => {
        hardhatNftmarketplace.listNft(0, hardhatNft.address, PRICE)
        const ownerStartEth = await ethers.provider.getBalance(owner.address)
        expect(
            await hardhatNftmarketplace
                .connect(addr1)
                .buyNft(0, hardhatNft.address, { value: PRICE })
        )
            .to.emit(hardhatNftmarketplace, "NftSold")
            .withArgs(addr1, 0, hardhatNft.address, PRICE)

        assert.isTrue((await hardhatNft.ownerOf(0)) === addr1.address)
        await hardhatNftmarketplace.withdrawProceedings()
        const ownerEndEth = await ethers.provider.getBalance(owner.address)
        assert.isTrue(ownerEndEth.toBigInt() > ownerStartEth.toBigInt())
    })

    it("does not allow to list for unapproved contract", async () => {
        hardhatNft.setApprovalForAll(hardhatNftmarketplace.address, false)
        expect(
            await hardhatNftmarketplace.listNft(0, hardhatNft.address, PRICE)
        ).to.be.revertedWithCustomError(
            hardhatNftmarketplace,
            "NftMarketplace__NotApprovedForMarketplace"
        )
    })

    it("does not allow to buy listed nft item for seller", async () => {
        hardhatNftmarketplace.listNft(0, hardhatNft.address, PRICE)
        await expect(
            hardhatNftmarketplace.buyNft(0, hardhatNft.address, { value: PRICE })
        ).to.be.revertedWithCustomError(
            hardhatNftmarketplace,
            "NftMarketplace__SellerCannotBeBuyer"
        )
    })

    it("does not allow to buy listed nft item with incorrect send value", async () => {
        hardhatNftmarketplace.listNft(0, hardhatNft.address, PRICE)
        await expect(
            hardhatNftmarketplace.connect(addr1).buyNft(0, hardhatNft.address, { value: "1" })
        ).to.be.revertedWithCustomError(hardhatNftmarketplace, "NftMarketplace__IncorrectPrice")

        assert.isTrue((await hardhatNft.ownerOf(0)) === owner.address)
        await expect(hardhatNftmarketplace.withdrawProceedings())
            .to.be.revertedWithCustomError(
                hardhatNftmarketplace,
                "NftMarketplace__NoProceedingsToWithdraw"
            )
            .withArgs(owner.address)
    })
})

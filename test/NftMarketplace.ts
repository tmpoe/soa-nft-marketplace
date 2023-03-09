import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { ethers } from "hardhat"
import { Nft, NftMarketplace, VRFCoordinatorV2Mock } from "../typechain-types"
import { BigNumber, ContractReceipt } from "ethers"

const BASE_FEE = "250000000000000000" // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas
const FUND_AMOUNT = "1000000000000000000000"
const CALLBACK_GAS_LIMIT = "500000"
const PRICE = ethers.utils.parseEther("0.1")

describe("Marketplace tests", () => {
    let owner: SignerWithAddress,
        addr1: SignerWithAddress,
        subscriptionId: number,
        nft,
        hardhatNft: Nft,
        vrfCoordinatorV2Mock,
        hardhatVrfCoordinatorV2Mock: VRFCoordinatorV2Mock,
        nftmarketplace,
        hardhatNftmarketplace: NftMarketplace

    beforeEach(async () => {
        ;[owner, addr1] = await ethers.getSigners()

        nft = await ethers.getContractFactory("Nft")
        vrfCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock")
        hardhatVrfCoordinatorV2Mock = await vrfCoordinatorV2Mock.deploy(BASE_FEE, GAS_PRICE_LINK)

        const response = await hardhatVrfCoordinatorV2Mock.createSubscription({
            from: owner.address,
        })

        const receipt: ContractReceipt = await response.wait()
        subscriptionId = receipt.events![0].args!.subId

        await hardhatVrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT, {
            from: owner.address,
        })
        const gasLane = ethers.constants.HashZero
        hardhatNft = await nft.deploy(["cat1", "cat2", "cat3"])
        await hardhatNft.deployed()

        nftmarketplace = await ethers.getContractFactory("NftMarketplace")
        hardhatNftmarketplace = await nftmarketplace.deploy(
            hardhatNft.address,
            1,
            hardhatVrfCoordinatorV2Mock.address,
            subscriptionId,
            gasLane,
            CALLBACK_GAS_LIMIT
        )
        hardhatNftmarketplace.deployed()

        await hardhatVrfCoordinatorV2Mock.addConsumer(
            subscriptionId,
            hardhatNftmarketplace.address
        )
    })

    it("is requestable to mint", async () => {
        const fee: BigNumber = await hardhatNftmarketplace.getMintingFee()

        await expect(
            hardhatNftmarketplace.requestNft({ value: fee.toString(), from: owner.address })
        )
            .to.emit(hardhatNftmarketplace, "NftRequested")
            .withArgs(1, owner.address)
    })

    it("allows anyone to request", async () => {
        const fee: BigNumber = await hardhatNftmarketplace.getMintingFee()
        await expect(hardhatNftmarketplace.requestNft({ value: fee.toString() }))
            .to.emit(hardhatNftmarketplace, "NftRequested")
            .withArgs(1, owner.address)
        await expect(hardhatNftmarketplace.connect(addr1).requestNft({ value: fee.toString() }))
            .to.emit(hardhatNftmarketplace, "NftRequested")
            .withArgs(2, addr1.address)
    })

    it("fails to mint in case of insufficient funds", async () => {
        await expect(hardhatNftmarketplace.requestNft()).to.be.revertedWithCustomError(
            hardhatNftmarketplace,
            "NftMarketplace__InsufficientFunds"
        )
    })
})

describe("Pre-existing Nft tests", () => {
    let owner: SignerWithAddress,
        addr1: SignerWithAddress,
        subscriptionId: number,
        nft,
        hardhatNft: Nft,
        vrfCoordinatorV2Mock,
        hardhatVrfCoordinatorV2Mock: VRFCoordinatorV2Mock,
        nftmarketplace,
        hardhatNftmarketplace: NftMarketplace

    beforeEach(async () => {
        ;[owner, addr1] = await ethers.getSigners()

        nft = await ethers.getContractFactory("Nft")
        vrfCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock")
        hardhatVrfCoordinatorV2Mock = await vrfCoordinatorV2Mock.deploy(BASE_FEE, GAS_PRICE_LINK)

        const response = await hardhatVrfCoordinatorV2Mock.createSubscription({
            from: owner.address,
        })

        const receipt: ContractReceipt = await response.wait()
        subscriptionId = receipt.events![0].args!.subId

        await hardhatVrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT, {
            from: owner.address,
        })
        const gasLane = ethers.constants.HashZero
        hardhatNft = await nft.deploy(["cat1", "cat2", "cat3"])
        await hardhatNft.deployed()

        nftmarketplace = await ethers.getContractFactory("NftMarketplace")
        hardhatNftmarketplace = await nftmarketplace.deploy(
            hardhatNft.address,
            1,
            hardhatVrfCoordinatorV2Mock.address,
            subscriptionId,
            gasLane,
            CALLBACK_GAS_LIMIT
        )
        hardhatNftmarketplace.deployed()

        await hardhatVrfCoordinatorV2Mock.addConsumer(
            subscriptionId,
            hardhatNftmarketplace.address
        )

        const fee = await hardhatNftmarketplace.getMintingFee()
        const requestNftResponse = await hardhatNftmarketplace.requestNft({
            value: fee.toString(),
        })
        const requestNftReceipt = await requestNftResponse.wait(1)
        await hardhatVrfCoordinatorV2Mock.fulfillRandomWords(
            requestNftReceipt.events![1].args!.requestId,
            hardhatNftmarketplace.address
        )

        const tokenCounter = await hardhatNft.getTokenCounter()
        assert.equal(tokenCounter.toString(), "1")
        assert.isTrue((await hardhatNft.tokenURI(0)).includes("cat"))
        assert.equal(await hardhatNft.ownerOf(0), owner.address)
    })

    it.skip("mints NFT after random number returned", async function () {
        await new Promise<void>(async (resolve, reject) => {
            hardhatNftmarketplace.once("NftMinted", async () => {
                console.log("triggered")
                try {
                    const tokenCounter = await hardhatNft.getTokenCounter()
                    assert.equal(tokenCounter.toString(), "1")
                    assert.isTrue((await hardhatNft.tokenURI(0)).includes("cat"))
                    assert.equal(await hardhatNft.ownerOf(0), owner.address)
                    console.log("Mft binted!")
                    resolve()
                } catch (e) {
                    console.log(e)
                    reject(e)
                }
            })
            try {
                let fee = await hardhatNftmarketplace.getMintingFee()
                let requestNftResponse = await hardhatNftmarketplace.requestNft({
                    value: fee.toString(),
                })

                let requestNftReceipt = await requestNftResponse.wait(1)
                await hardhatVrfCoordinatorV2Mock.fulfillRandomWords(
                    requestNftReceipt.events![1].args!.requestId,
                    hardhatNft.address
                )
            } catch (e) {
                console.log(e)
                reject(e)
            }
        })
    })

    it("Facilitates listings", async () => {
        await expect(hardhatNftmarketplace.listNft(0, hardhatNft.address, PRICE))
            .to.emit(hardhatNftmarketplace, "NftListed")
            .withArgs(0, owner.address, PRICE, hardhatNft.address)
    })

    it("does not allow relisting", async () => {
        hardhatNftmarketplace.listNft(0, hardhatNft.address, PRICE)

        await expect(
            hardhatNftmarketplace.listNft(0, hardhatNft.address, PRICE)
        ).to.be.revertedWithCustomError(hardhatNftmarketplace, "NftMarketplace__ItemAlreadyListed")
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
})

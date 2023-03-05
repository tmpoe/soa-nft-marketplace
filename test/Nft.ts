import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { ethers } from "hardhat"
import { Nft, VRFCoordinatorV2Mock } from "../typechain-types"
import { BigNumber, ContractReceipt } from "ethers"

const BASE_FEE = "250000000000000000" // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas
const FUND_AMOUNT = "1000000000000000000000"
const CALLBACK_GAS_LIMIT = "500000"

describe("Nft minting tests", () => {
    let owner: SignerWithAddress,
        addr1: SignerWithAddress,
        subscriptionId: number,
        nft,
        hardhatNft: Nft,
        vrfCoordinatorV2Mock,
        hardhatVrfCoordinatorV2Mock: VRFCoordinatorV2Mock

    const firstIndex = 0
    const secondIndex = 1

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
        hardhatNft = await nft.deploy(
            1,
            hardhatVrfCoordinatorV2Mock.address,
            subscriptionId,
            gasLane,
            CALLBACK_GAS_LIMIT
        )
        await hardhatNft.deployed()

        await hardhatVrfCoordinatorV2Mock.addConsumer(subscriptionId, hardhatNft.address)
    })

    it("is requestable to mint", async () => {
        const fee: BigNumber = await hardhatNft.getMintingFee()

        await expect(hardhatNft.requestNft({ value: fee.toString(), from: owner.address }))
            .to.emit(hardhatNft, "NftRequested")
            .withArgs(1, owner.address)
    })

    it("allows anyone to request", async () => {
        const fee: BigNumber = await hardhatNft.getMintingFee()
        await expect(hardhatNft.requestNft({ value: fee.toString() }))
            .to.emit(hardhatNft, "NftRequested")
            .withArgs(1, owner.address)
        await expect(hardhatNft.connect(addr1).requestNft({ value: fee.toString() }))
            .to.emit(hardhatNft, "NftRequested")
            .withArgs(2, addr1.address)
    })

    it("fails to mint in case of insufficient funds", async () => {
        await expect(hardhatNft.requestNft()).to.be.revertedWithCustomError(
            hardhatNft,
            "Nft__InsufficientFunds"
        )
    })
})

describe("Nft behaviour tests", () => {
    let owner: SignerWithAddress,
        addr1: SignerWithAddress,
        subscriptionId: number,
        nft,
        hardhatNft: Nft,
        vrfCoordinatorV2Mock,
        hardhatVrfCoordinatorV2Mock: VRFCoordinatorV2Mock
    const firstIndex = 0
    const secondIndex = 1

    beforeEach(async () => {
        ;[owner, addr1] = await ethers.getSigners()

        nft = await ethers.getContractFactory("Nft")

        vrfCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock")
        hardhatVrfCoordinatorV2Mock = await vrfCoordinatorV2Mock.deploy(BASE_FEE, GAS_PRICE_LINK)

        const response = await hardhatVrfCoordinatorV2Mock.createSubscription()
        const receipt: ContractReceipt = await response.wait()
        subscriptionId = receipt.events![0].args!.subId

        await hardhatVrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
        const gasLane = "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
            hardhatNft = await nft.deploy(
                1,
                hardhatVrfCoordinatorV2Mock.address,
                subscriptionId,
                gasLane,
                CALLBACK_GAS_LIMIT
            )
        await hardhatNft.deployed()

        await hardhatNft.deployed()
        const fee: BigNumber = await hardhatNft.getMintingFee()
        await hardhatNft.requestNft({ value: fee.toString() })
    })

    it.skip("can change owners", async () => {
        await hardhatNft.transferFrom(owner.address, addr1.address, 0)
        assert(addr1.address === (await hardhatNft.ownerOf(0)))
    })

    it.skip("does not allow other then the owner to initiate owner change", async () => {
        await expect(
            hardhatNft.connect(addr1).transferFrom(owner.address, addr1.address, 0)
        ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved")
    })
})

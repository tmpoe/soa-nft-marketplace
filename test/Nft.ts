import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { ethers } from "hardhat"
import { Nft, VRFCoordinatorV2Mock } from "../typechain-types"
import { BigNumber, ContractReceipt } from "ethers"

const BASE_FEE = "250000000000000000" // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas
const FUND_AMOUNT = "1000000000000000000000"
const CALLBACK_GAS_LIMIT = "500000"
const REQUEST_CONFIRMATIONS = 3

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

    it("mints NFT after random number returned", async function () {
        await new Promise<void>(async (resolve, reject) => {
            hardhatNft.once("NftMinted", async () => {
                try {
                    const tokenCounter = await hardhatNft.getTokenCounter()
                    assert.equal(tokenCounter.toString(), "1")
                    console.log("Nft minted!")
                    resolve()
                } catch (e) {
                    console.log(e)
                    reject(e)
                }
            })
            try {
                const fee = await hardhatNft.getMintingFee()
                const requestNftResponse = await hardhatNft.requestNft({
                    value: fee.toString(),
                })
                const requestNftReceipt = await requestNftResponse.wait(1)
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
})

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { ethers } from "hardhat"
import { BigNumber, ContractReceipt, Contract } from "ethers"

const BASE_FEE = "250000000000000000" // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas
const FUND_AMOUNT = "1000000000000000000000"
const CALLBACK_GAS_LIMIT = "500000"

let owner: SignerWithAddress,
    addr1: SignerWithAddress,
    subscriptionId: number,
    nftCatAttributes,
    hardhatNftCatAttributes: Contract,
    vrfCoordinatorV2Mock,
    hardhatVrfCoordinatorV2Mock: Contract

describe("Cat attribute tests", () => {
    beforeEach(async () => {
        ;[owner, addr1] = await ethers.getSigners()
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

        nftCatAttributes = await ethers.getContractFactory("NftCatAttributes")

        hardhatNftCatAttributes = await nftCatAttributes.deploy(
            hardhatVrfCoordinatorV2Mock.address,
            subscriptionId,
            gasLane,
            CALLBACK_GAS_LIMIT
        )

        await hardhatVrfCoordinatorV2Mock.addConsumer(
            subscriptionId,
            hardhatNftCatAttributes.address
        )
    })

    it("Emits an event on attribute request", async () => {
        expect(await hardhatNftCatAttributes.requestCatAttributes())
            .to.emit(hardhatNftCatAttributes, "NftCatAttributesRequested")
            .withArgs(0, owner.address)
    })

    it("allows anyone to request", async () => {
        expect(await hardhatNftCatAttributes.connect(addr1).requestCatAttributes())
            .to.emit(hardhatNftCatAttributes, "NftCatAttributesRequested")
            .withArgs(0, owner.address)
    })

    it("mints NFT after random number returned", async function () {
        await new Promise<void>(async (resolve, reject) => {
            hardhatNftCatAttributes.once(
                "NftCatAttributesCreated",
                async (requestId, owner_address, breed, color, playfulness, cuteness, event) => {
                    console.log("triggered")
                    try {
                        console.log(
                            requestId,
                            owner_address,
                            breed,
                            color,
                            playfulness,
                            cuteness,
                            event
                        )
                        assert.notEqual(requestId, undefined)
                        assert.equal(owner.address, owner_address)
                        assert.notEqual(breed, undefined)
                        assert.notEqual(color, undefined)
                        assert.notEqual(playfulness, undefined)
                        assert.notEqual(cuteness, undefined)
                    } catch (e) {
                        console.log(e)
                        reject(e)
                    }
                }
            )
            try {
                let requestNftResponse = await hardhatNftCatAttributes.requestCatAttributes({})

                let requestNftReceipt = await requestNftResponse.wait(1)
                await hardhatVrfCoordinatorV2Mock.fulfillRandomWords(
                    requestNftReceipt.events![1].args!.requestId,
                    hardhatNftCatAttributes.address
                )
            } catch (e) {
                console.log(e)
                reject(e)
            }
        })
    })
})

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { ethers, deployments } from "hardhat"
import { ContractReceipt, Contract } from "ethers"
import { NftCatAttributes, NftCatAttributes__factory } from "../../typechain-types"

const BASE_FEE = "250000000000000000" // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas
const FUND_AMOUNT = "1000000000000000000000"
const CALLBACK_GAS_LIMIT = "500000"

let owner: SignerWithAddress,
    addr1: SignerWithAddress,
    subscriptionId: number,
    // Exact typings
    nftCatAttributes: NftCatAttributes,
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

        // no need for deployment, a localnode will run for each test
        const nftCatAttributesContract = await deployments.get("NftCatAttributes")

        // using factories result in typed contracts
        nftCatAttributes = NftCatAttributes__factory.connect(
            nftCatAttributesContract.address,
            owner
        )

        await hardhatVrfCoordinatorV2Mock.addConsumer(
            subscriptionId,
            hardhatNftCatAttributes.address
        )
    })

    it("Emits an event on attribute request", async () => {
        expect(await hardhatNftCatAttributes.requestCatAttributes(owner.address))
            .to.emit(hardhatNftCatAttributes, "NftCatAttributesRequested")
            .withArgs(0, owner.address)
    })

    it("allows only owner to request", async () => {
        await expect(
            hardhatNftCatAttributes.connect(addr1).requestCatAttributes(addr1.address)
        ).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("mints NFT after random number returned", async function () {
        await new Promise<void>(async (resolve, reject) => {
            hardhatNftCatAttributes.once(
                "NftCatAttributesCreated",
                async (requestId, owner_address, breed, color, playfulness, cuteness, event) => {
                    console.debug("triggered")
                    try {
                        assert.notEqual(requestId, undefined)
                        assert.equal(owner.address, owner_address)
                        assert.notEqual(breed, undefined)
                        assert.notEqual(color, undefined)
                        assert.notEqual(playfulness, undefined)
                        assert.notEqual(cuteness, undefined)
                        resolve()
                    } catch (e) {
                        console.debug(e)
                        reject(e)
                    }
                }
            )
            try {
                let mintNftCatAttributes = await hardhatNftCatAttributes.requestCatAttributes(
                    owner.address
                )

                let mintNftCatAttributesReceipt = await mintNftCatAttributes.wait(1)
                await hardhatVrfCoordinatorV2Mock.fulfillRandomWords(
                    mintNftCatAttributesReceipt.events![1].args!.requestId,
                    hardhatNftCatAttributes.address
                )
            } catch (e) {
                console.debug(e)
                reject(e)
            }
        })
    })
})

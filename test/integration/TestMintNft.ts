import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { ethers } from "hardhat"
import { network, getChainId } from "hardhat"
import { ContractReceipt, Contract, ContractFactory } from "ethers"
import {
    /* ADDRESS_LOCATION, networkConfig, */ developmentChains,
} from "../../helper-hardhat-config"
/* const fs = require("fs") */

const BASE_FEE = "250000000000000000" // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas
const FUND_AMOUNT = "1000000000000000000000"
const CALLBACK_GAS_LIMIT = "500000"

let owner: SignerWithAddress,
    addr1: SignerWithAddress,
    subscriptionId: number,
    nftCatAttributes: ContractFactory,
    hardhatNftCatAttributes: Contract,
    vrfCoordinatorV2Mock: ContractFactory,
    hardhatVrfCoordinatorV2Mock: Contract,
    nft: ContractFactory,
    hardhatNft: Contract,
    nftMarketplace: ContractFactory,
    hardhatNftmarketplace: Contract

!developmentChains.includes(network.name)
    ? console.debug("Not dev chain")
    : describe("Full mint nft integration tests", () => {
          beforeEach(async () => {
              ;[owner, addr1] = await ethers.getSigners()
              vrfCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock")
              hardhatVrfCoordinatorV2Mock = await vrfCoordinatorV2Mock.deploy(
                  BASE_FEE,
                  GAS_PRICE_LINK
              )

              const response = await hardhatVrfCoordinatorV2Mock.createSubscription({
                  from: owner.address,
              })

              const receipt: ContractReceipt = await response.wait()
              subscriptionId = receipt.events![0].args!.subId

              await hardhatVrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT, {
                  from: owner.address,
              })
              nftCatAttributes = await ethers.getContractFactory("NftCatAttributes")
              const gasLane = ethers.constants.HashZero

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

              nft = await ethers.getContractFactory("Nft")
              //hardhatNft = await nft.attach(nativeNftAddress)
              hardhatNft = await nft.deploy()

              await hardhatNft.deployed()
              nftMarketplace = await ethers.getContractFactory("NftMarketplace")
              //hardhatNftmarketplace = await nftMarketplace.attach(nftMarketplaceAddress)

              hardhatNftmarketplace = await nftMarketplace.deploy(hardhatNft.address, 1)
              await hardhatNftmarketplace.deployed()
          })

          it("Can mint a fully functional nft", async () => {
              await new Promise<void>(async (resolve, reject) => {
                  hardhatNftCatAttributes.once(
                      "NftCatAttributesCreated",
                      async (
                          requestId,
                          owner,
                          breed,
                          color,
                          playfulness,
                          cuteness,
                          rarity,
                          event
                      ) => {
                          console.debug("triggered")
                          try {
                              const jumbledUpAttributes = `${requestId.toString()}_${owner}_${breed}_${color}_${playfulness.toString()}_${cuteness.toString()}_${rarity}`
                              console.debug(owner)
                              expect(
                                  await hardhatNftmarketplace.mintNft(jumbledUpAttributes, owner)
                              )
                                  .to.emit(hardhatNftmarketplace, "NftMinted")
                                  .withArgs(owner, 0)

                              assert.equal(await hardhatNft.tokenURI(0), jumbledUpAttributes)

                              resolve()
                          } catch (e) {
                              console.debug(e)
                              reject(e)
                          }
                      }
                  )
                  try {
                      console.debug(owner.address)
                      console.debug(hardhatNftCatAttributes.address)
                      let tx = await hardhatNftCatAttributes.requestCatAttributes(owner.address)
                      let receipt = await tx.wait(1)
                      tx = await hardhatVrfCoordinatorV2Mock.fulfillRandomWords(
                          receipt.events![1].args!.requestId,
                          hardhatNftCatAttributes.address
                      )
                      const rec = await tx.wait()
                  } catch (e) {
                      console.debug(e)
                      reject(e)
                  }
              })
          })
      })

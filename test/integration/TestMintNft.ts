import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { ethers } from "hardhat"
const hre = require("hardhat")
import { ContractReceipt, Contract } from "ethers"
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
    nftCatAttributes,
    hardhatNftCatAttributes: Contract,
    vrfCoordinatorV2Mock,
    hardhatVrfCoordinatorV2Mock: Contract,
    nft,
    hardhatNft: Contract,
    nftMarketplace,
    hardhatNftmarketplace: Contract

const { network, getChainId } = hre
!developmentChains.includes(network.name)
    ? console.log("Not dev chain")
    : describe("Full mint nft integration tests", () => {
          beforeEach(async () => {
              const chainId = await getChainId()
              /*
              const contractAddresses = JSON.parse(fs.readFileSync(ADDRESS_LOCATION, "utf8"))

              const catAttributesAddress = contractAddresses[chainId]["NftCatAttributes"].at(-1)
              const nativeNftAddress = contractAddresses[chainId]["Nft"].at(-1)
              const nftMarketplaceAddress = contractAddresses[chainId]["NftMarketplace"].at(-1)
              */
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

              //hardhatNftCatAttributes = await nftCatAttributes.attach(catAttributesAddress)

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
                      async (requestId, owner, breed, color, playfulness, cuteness, event) => {
                          console.log("triggered")
                          try {
                              console.log(
                                  requestId,
                                  owner,
                                  breed,
                                  color,
                                  playfulness,
                                  cuteness,
                                  event
                              )
                              const jumbledUpAttributes = `${requestId.toString()}_${owner}_${breed}_${color}_${playfulness.toString()}_${cuteness.toString()}`
                              const mintFee = await hardhatNftmarketplace.getMintingFee()
                              expect(
                                  await hardhatNftmarketplace.requestNft(jumbledUpAttributes, {
                                      value: mintFee,
                                  })
                              )
                                  .to.emit(hardhatNftmarketplace, "NftMinted")
                                  .withArgs(owner.address)

                              assert.equal(await hardhatNft.tokenURI(0), jumbledUpAttributes)

                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      }
                  )
                  try {
                      let requestNftResponse = await hardhatNftCatAttributes.requestCatAttributes()

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

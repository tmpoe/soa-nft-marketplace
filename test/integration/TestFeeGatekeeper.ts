import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { ethers } from "hardhat"
import { network, getChainId } from "hardhat"
import { ContractReceipt, Contract, ContractFactory } from "ethers"
import { developmentChains } from "../../helper-hardhat-config"

let owner: SignerWithAddress,
    nftMarketplace: ContractFactory,
    hardhatNftmarketplace: Contract,
    feeGatekeeper: ContractFactory,
    hardhatFeeGatekeeper: Contract

const PRICE = ethers.utils.parseEther("0.1")

describe("Fee Gatekeeper tests", () => {
    beforeEach(async () => {
        nftMarketplace = await ethers.getContractFactory("NftMarketplace")

        hardhatNftmarketplace = await nftMarketplace.deploy(ethers.constants.AddressZero)
        await hardhatNftmarketplace.deployed()

        feeGatekeeper = await ethers.getContractFactory("FeeGatekeeper")
        hardhatFeeGatekeeper = await feeGatekeeper.deploy(hardhatNftmarketplace.address, PRICE)
        await hardhatFeeGatekeeper.deploy()
    })

    it("can transfer funds to marketplace", async () => {
        const marketplaceStartEth = await ethers.provider.getBalance(hardhatNftmarketplace.address)
        const tx = await hardhatFeeGatekeeper.gatekeepMinting({ value: PRICE })
        tx.wait(1)

        const marketplaceEndEth = await ethers.provider.getBalance(hardhatNftmarketplace.address)
        assert.isTrue(marketplaceEndEth > marketplaceStartEth)
    })
})

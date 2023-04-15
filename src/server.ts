import express from "express"
import mintNft from "./mint_nft"
import { ethers } from "hardhat"

const app = express()

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE")
    next()
})

app.post("/:address", (req, res) => {
    if (!ethers.utils.isAddress(req.params.address)) {
        res.status(400).send("Invalid address")
        //return
    }
    try {
        mintNft(req.params.address) // Todo make minting non blocking
        res.send(`nft requested for ${req.params.address}`)
    } catch (e) {
        console.error("Requst failed")
    }
})

process.on("uncaughtException", function (err) {
    console.error("Minting error: ", err)
})

app.listen(5000, () => {
    console.debug("The application is listening on port 5000!")
})

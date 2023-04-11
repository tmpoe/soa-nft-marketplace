import express from "express"
import mintNft from "./mint_nft"

const app = express()

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE")
    next()
})

app.post("/:address", async (req, res) => {
    mintNft(req.params.address)
    res.send(`nft requested for ${req.params.address}`)
})

app.listen(4999, () => {
    console.debug("The application is listening on port 5000!")
})

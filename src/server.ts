import express from "express"
import mintNft from "./mint_nft"

const app = express()

app.post("/:address", async (req, res) => {
    await mintNft(req.params.address)
    res.send(`nft requested for ${req.params.address}`)
})

app.listen(5000, () => {
    console.log("The application is listening on port 5000!")
})

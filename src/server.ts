import express from "express"
import mintNft from "./mint_nft"

const app = express()

app.post("/:address", async (req, res) => {
    try {
        await mintNft(req.params.address)
        res.send(`nft requested for ${req.params.address}`)
    } catch (e) {
        res.status(500)
        res.send(e)
    }
})

app.listen(5000, () => {
    console.debug("The application is listening on port 5000!")
})

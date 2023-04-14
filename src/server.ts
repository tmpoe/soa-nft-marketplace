import express from "express"
import mintNft from "./mint_nft"

const app = express()

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE")
    next()
})

app.post("/:address", async (req, res) => {
    try {
        await mintNft(req.params.address) // Todo make minting non blocking
        res.send(`nft requested for ${req.params.address}`)
    } catch (e) {
        res.status(400).send(e)
    }
})

app.listen(5000, () => {
    console.debug("The application is listening on port 5000!")
})

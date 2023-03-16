import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"

dotenv.config()

const app: Express = express()
const port = process.env.SERVER_PORT

// will not use this for now, first will make the frontend work,
// and will move smart contract calls behind an API call - RN this
// IDK how this could work and would rather make something that works
// first
app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server")
})

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`)
})

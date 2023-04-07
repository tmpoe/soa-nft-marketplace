import { run } from "hardhat"

const verify = async (contractAddress: string, args: Array<any>) => {
    console.debug(`Verifying contract ${contractAddress}`)
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
        console.debug("Verified")
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.debug("Already verified!")
        } else {
            console.debug(e)
        }
    }
}

export { verify }

import { run } from "hardhat"

const verify = async (contractAddress: string, args: Array<any>) => {
    console.log(`Verifying contract ${contractAddress}`)
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
        console.log("Verified")
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}

export { verify }

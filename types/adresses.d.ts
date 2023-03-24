type DeployedContractAddress = {
    addresses: Array<string>
}

type Chain = {
    31337: DeployedContractAddress
    11155111: DeployedContractAddress
    00000: DeployedContractAddress
}

export { Chain }

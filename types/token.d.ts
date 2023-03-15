type attribute = {
    trait_type: string
    value: number | string
}

type tokenMetadata = {
    name: string
    imageLocation: string
    description: string
    attributes: Array<attribute>
}

export { tokenMetadata }

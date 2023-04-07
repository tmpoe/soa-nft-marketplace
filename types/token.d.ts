type attribute = {
    trait_type: string
    value: number | string
}

type tokenMetadata = {
    name: string
    imageLocation: string
    attributes: Array<attribute>
}

export { tokenMetadata, attribute }

type UploadedImage = {
    image: File
    imageURL: string
}

type Layer = {
    number: number
    name?: string
    options: LayerOption[]
}

type LayerOption = {
    key: string
    image: File
    imageURL: string
    rarity?: 'l' | 'm' | 'r' | 'sr'
    metadata?: string
}

enum CollectionStatus {
    CREATED = 'CREATED',
    PROCESSING = 'PROCESSING',
    PROCESSED = 'PROCESSED',
    UPLOADING = 'UPLOADING',
    UPLOADED = 'UPLOADED',
    DEPLOYED = 'DEPLOYED',
}

type ContractSpec = {
    collectionName: string;
    collectionSize: number;
    whitelist: string[]
    firstRoyaltyWallet: string
    firstRoyaltyPercentage: number
    secondRoyaltyWallet?: string
    secondRoyaltyPercentage?: number
}

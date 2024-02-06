import axios from 'config/axios'

const fetchCollection = async ({
    queryKey,
}): Promise<{
    collectionId: string
    collectionName: string
    collectionSize: number
    collectionStatus: CollectionStatus
    contractAddress: string
    imagesDirectoryHash: string
    jsonFilesDirectoryHash: string
}> => {
    const [_, collectionId] = queryKey
    const result = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/collection/${collectionId}`
    )
    return result.data
}

const fetchCollectionStatus = async ({ queryKey }) => {
    const [_, collectionId] = queryKey
    const result = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/collection/${collectionId}/status`
    )
    return result.data
}

const fetchDeployedCollection = async ({ queryKey }) => {
    const [_, collectionId] = queryKey
    const result = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/collection/deployed/${collectionId}`
    )
    return result.data
}

const fetchDeployedCollections = async ({
    queryKey,
}): Promise<
    {
        collectionId: string
        collectionName: string
    }[]
> => {
    const [_, publicAddress] = queryKey
    const queryString = publicAddress
        ? 'collectionStatus=DEPLOYED&publicAddress=' + publicAddress
        : 'collectionStatus=DEPLOYED'
    return await axios
        .get(`${process.env.REACT_APP_SERVER_URL}/collections?${queryString}`)
        .then((result) => result.data)
}

export {
    fetchCollection,
    fetchCollectionStatus,
    fetchDeployedCollection,
    fetchDeployedCollections,
}

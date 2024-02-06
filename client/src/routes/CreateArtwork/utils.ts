import { upperFirst } from 'lodash'

export const MINIMUM_LAYERS = 5
export const MINIMUM_OPTIONS_PER_LAYER = 5

export const formatName = (str: string) =>
    str
        .split(' ')
        .map((s: string) => upperFirst(s))
        .join('-')

export const getFormDataForGeneratedCollection = (
    collectionSize: string,
    layers: Layer[]
) => {
    const formData = new FormData()

    formData.append('collectionSize', collectionSize)

    layers.forEach(({ number, name, options }) => {
        const encodedLayerName = `${number}_${formatName(name!)}`

        options.forEach(({ metadata, rarity, image }) => {
            const encodedLayerOptionName = `${formatName(metadata!)}_${rarity}`
            formData.append(
                'images',
                image!,
                `${encodedLayerName}_${encodedLayerOptionName}.png`
            )
        })
    })
    return formData
}

export const getFormDataForUploadedCollection = (images: UploadedImage[]) => {
    const formData = new FormData()

    images.forEach(({ image }) => {
        formData.append('images', image!, image.name)
    })
    return formData
}

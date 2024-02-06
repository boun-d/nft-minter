import React, { useEffect, useState } from 'react'

import previewPlaceholder from 'common/images/preview-placeholder.png'

interface Props {
    layers?: Layer[]
    images?: UploadedImage[]
}

const Preview: React.FC<Props> = ({ layers, images }) => {
    const [latestImageURLs, setLatestImageURLs] = useState<string[]>([])

    const getLatestLayerURLS = (layers: Layer[]): string[] => {
        const result: string[] = []
        for (const layer of layers) {
            if (!layer?.options.length) continue
            const optionsLength = layer.options.length
            result.push(layer.options[optionsLength - 1]?.imageURL)
        }
        return result
    }
    const getLatestImageURL = (images: UploadedImage[]) => {
        const imagesLength = images.length
        return images[imagesLength - 1]?.imageURL
    }

    useEffect(() => {
        layers?.length &&
            setLatestImageURLs(() => getLatestLayerURLS(layers || []))
    }, [layers])

    useEffect(() => {
        images?.length &&
            setLatestImageURLs(() => [getLatestImageURL(images || [])])
    }, [images])

    return (
        <div style={{}}>
            {!!latestImageURLs.length ? (
                <div
                    style={{
                        position: 'relative',
                        height: 'calc((40vw - 8rem) - 6rem)',
                    }}
                >
                    {latestImageURLs.map((url, i) => (
                        <img
                            src={url}
                            style={{
                                width: '100%',
                                position: 'absolute',
                                top: '0',
                                right: '0',
                            }}
                            key={i}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ border: '0.3vw solid rgb(6,26,44)' }}>
                    <img src={previewPlaceholder} style={{ width: '100%' }} />
                </div>
            )}
        </div>
    )
}

export default Preview

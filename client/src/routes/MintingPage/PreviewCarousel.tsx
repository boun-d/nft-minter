import React from 'react'
import styled, { keyframes } from 'styled-components'
import { chunk } from 'lodash'

const primaryAnimation = keyframes`
    from {
        left: 0%;
    }
    to {
        left: -100%;
    }
`

const secondaryAnimation = keyframes`
    from {
        left: 100%;
    }
    to {
        left: 0%;
    }
`

const PreviewCarouselWrapper = styled.div`
    border-top-left-radius: 0.75rem;
    border-top-right-radius: 0.75rem;
    border-bottom-left-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
    position: relative;
    height: auto;
    overflow-x: hidden;

    .art-parent {
        position: relative;
        width: 280px;
        height: 70px;
        overflow-x: hidden;
    }
    .art {
        position: absolute;
        background-color: #7cecca;
        position: absolute;
        height: inherit;

        display: flex;
        align-items: center;
    }
    .art img {
        height: inherit;
        image-rendering: pixelated;
    }
    .primary {
        animation: ${primaryAnimation} 20s linear infinite;
    }
    .secondary {
        animation: ${secondaryAnimation} 20s linear infinite;
    }
`

interface PreviewCarouselProps {
    imageSources: string[]
}

export const PreviewCarousel: React.FC<PreviewCarouselProps> = ({
    imageSources,
}) => {
    const rows: string[][] = chunk(imageSources, imageSources.length / 4)

    return (
        <PreviewCarouselWrapper>
            {rows.map((row, i) => (
                <div className="art-parent">
                    <div className="art primary" key={`row-${i}`}>
                        {row.map((image, i) => (
                            <img src={image} key={`${i}-primary`} />
                        ))}
                    </div>
                    <div className="art secondary">
                        {row.map((image, i) => (
                            <img src={image} key={`${i}-secondary`} />
                        ))}
                    </div>
                </div>
            ))}
        </PreviewCarouselWrapper>
    )
}

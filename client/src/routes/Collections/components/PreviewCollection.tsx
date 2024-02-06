import React from 'react'
import { Button } from 'antd'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'

const PreviewCollectionWrapper = styled.div`
    width: 100%;
    border: 3px solid #8a959c;
    padding: 2.5rem 3rem;
    
    h2 {
        display: inline-block;
        margin: 0;
    }
`

interface Props {
    collectionId: string;
}

export const PreviewCollection: React.FC<Props> = ({ collectionId }) => {
    const navigateTo = useNavigate()

    return (
        <PreviewCollectionWrapper>
            <h2>Preview collection artwork and metadata</h2>
            <Button
                shape="round"
                type="primary"
                className="layer-button"
                onClick={() => navigateTo(`/~/preview-artwork/${collectionId}`)}
                size="small"
                style={{ height: '2rem', float: 'right' }}
            >
                Go
            </Button>
        </PreviewCollectionWrapper>
    )
}

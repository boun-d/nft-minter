import React, { useState } from 'react'
import { Button } from 'antd'
import { FillSeperator, MediumSpacer, SmallSpacer } from 'common/styles/common.styles'
import styled from 'styled-components'

const MintingPageURLWrapper = styled.div`
    width: 100%;
    border: 3px solid #8a959c;
    padding: 2.5rem 3rem;

    h2 {
        display: inline-block;
    }
`

interface Props {
    collectionId: string
}

export const MintingPageURL: React.FC<Props> = ({ collectionId }) => {
    const URL = `${process.env.REACT_APP_DNS}/collection/${collectionId}`

    const [buttonText, setButtonText] = useState<string>('Copy link')

    return (
        <MintingPageURLWrapper>
            <h2>Minting Page URL</h2>
            <Button
                shape="round"
                type="primary"
                onClick={() => {
                    navigator.clipboard.writeText(URL)
                    setButtonText('Copied!')
                    setTimeout(() => setButtonText('Copy link'), 1000)
                }}
                size="small"
                style={{ height: '2rem', float: 'right' }}
            >
                {buttonText}
            </Button>
            <div>
                <a href={URL}>{URL}</a>
            </div>
        </MintingPageURLWrapper>
    )
}

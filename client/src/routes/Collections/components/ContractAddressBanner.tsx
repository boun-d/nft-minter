import React from 'react'
import styled from 'styled-components'

const ContractAddressBannerWrapper = styled.div`
    width: 100%;
    padding: 0.5rem 1rem 0.5rem 1rem;

    h3 {
        display: inline-block;
        margin: 0;
    }
`

interface Props {
    contractAddress: string
}

export const ContractAddressBanner: React.FC<Props> = ({ contractAddress }) => {
    return (
        <ContractAddressBannerWrapper>
            <h3>{`Contract address : ${contractAddress}`}</h3>
        </ContractAddressBannerWrapper>
    )
}

import React, { useContext, useState } from 'react'
import { Button } from 'antd'
import {
    FillSeperator,
    MediumSpacer,
    SmallSpacer,
} from 'common/styles/common.styles'
import styled from 'styled-components'
import { UserContext } from 'context'

const TransactionCompleteBannerWrapper = styled.div`
    width: 100%;
    padding: 0.5rem 1rem;
    text-align: center;

    h2 {
        font-size: 2rem;
        
        display: inline-block;
        margin: 0;
    }
    button {
        background-color: white;
        border: 0;
        border-radius: 0.5rem;
        aspect-ratio: 1 / 1;
        height: 100%;
        float: right;
        font-weight: bold;
        cursor: pointer;

        :hover {

        }
    }
`

export const TransactionCompleteBanner: React.FC = () => {
    return (
        <TransactionCompleteBannerWrapper>
            <h2>Transaction complete!</h2>
        </TransactionCompleteBannerWrapper>
    )
}

import React, { useContext, useState } from 'react'
import { Button } from 'antd'
import {
    FillSeperator,
    MediumSpacer,
    SmallSpacer,
} from 'common/styles/common.styles'
import styled from 'styled-components'
import { UserContext } from 'context'

const SignedInAsBannerWrapper = styled.div`
    width: 100%;
    border: 3px solid #8a959c;
    padding: 2.5rem 3rem;
    

    h2 {
        display: inline-block;
        margin: 0;
    }
`

export const SignedInAsBanner: React.FC = () => {
    const { currentUser } = useContext(UserContext);

    return (
        <SignedInAsBannerWrapper>
            <h2>{`Signed in as : ${currentUser?.walletOwner}`}</h2>
            <Button
                shape="round"
                type="primary"
                className="layer-button"
                onClick={() => {
                    localStorage.removeItem('token')
                    window.location.reload();
                }}
                size="small"
                style={{ height: '2rem', float: 'right' }}
            >
                Log out
            </Button>
        </SignedInAsBannerWrapper>
    )
}

import React from 'react'
import styled from 'styled-components'
import { LoadingSpinner } from './LoadingSpinner'

const LoadingPageWrapper = styled.div`
    height: 80vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`

const LoadingPage: React.FC = () => (
    <LoadingPageWrapper>
        <LoadingSpinner size="md" />
    </LoadingPageWrapper>
)

export default LoadingPage;

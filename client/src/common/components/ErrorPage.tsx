import React from 'react'
import styled from 'styled-components'
import { Button } from 'antd'

import { LoadingSpinner } from './LoadingSpinner'

const ErrorPageWrapper = styled.div`
    height: 500px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    div {
        border: 3px solid red;
        border-radius: 1rem;
        
        padding: 2.5rem 3rem;
        width: 70%;

        
        

        span {
            display: inline-block;
        }
    }
`

export type ErrorPageVariant = {
    title: string
    subtitle: string
}

const defaultVariant: ErrorPageVariant = {
    title: 'Error',
    subtitle: 'Oops! Something went wrong.',
}

interface Props {
    variant?: ErrorPageVariant
    retry: () => void
}

const ErrorPage: React.FC<Props> = ({ variant = defaultVariant, retry }) => (
    <ErrorPageWrapper>
        <div>
            <h2>{variant.title}</h2>
            <span>{variant.subtitle}</span>
            {!!retry && (
                <Button
                    shape="round"
                    type="primary"
                    className="layer-button"
                    onClick={() => retry()}
                    size="small"
                    style={{ height: '2rem', float: 'right' }}
                >
                    Try again
                </Button>
            )}
        </div>
    </ErrorPageWrapper>
)

export default ErrorPage

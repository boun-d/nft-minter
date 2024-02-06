import React from 'react'
import styled from 'styled-components'

import Modal from './Modal'

const ErrorModalWrapper = styled.div`
    height: 80vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
`

export type ErrorModalVariant = {
    title: string;
    body: React.ReactElement;
}

const defaultVariant: ErrorModalVariant = {
    title: 'Error',
    body: <span>Oops! Something went wrong.</span>
}

interface Props {
    variant?: ErrorModalVariant;
}

const ErrorModal: React.FC<Props> = ({ variant = defaultVariant }) => (
    <ErrorModalWrapper>
        <Modal title={variant.title}>
            {variant.body}
        </Modal>
    </ErrorModalWrapper>
)

export default ErrorModal

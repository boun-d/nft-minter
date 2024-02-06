import styled, { keyframes } from 'styled-components'

type Size = 'sm' | 'md' | 'lg'

const spin = keyframes`
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
`
    const Spinner = styled.div<{ border: string, dimensions: string }>`
        border: ${props => props.border}px solid #565656;
        border-top: ${props => props.border}px solid white;
        border-radius: 50%;
        width: ${props => props.dimensions}px;
        height: ${props => props.dimensions}px;
        animation: ${spin} 1s linear infinite;
    `

export const LoadingSpinner = ({ size }: { size: Size }) => {
    const border = size === 'sm' ? '5' : size === 'md' ? '10' : '20'
    const dimensions = size === 'sm' ? '50' : size === 'md' ? '100' : '200'

    return <Spinner {...{ border, dimensions }}/>
}

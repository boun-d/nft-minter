import styled from 'styled-components'

const MintingPageWrapper = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    

    .container {
        width: 280px;
    }

    .title {
        border-radius: 0.75rem;
        background-color: white;
        width: 280px;
        min-height: 50px;
        display: flex;
    }
    .title b {
        font-size: 1.25rem;
        margin: 1rem 2rem;
    }
    .gif {
        border-radius: 0.75rem;
        img {
            border-radius: 0.75rem;
            width: 280px;
            height: auto;
        }
    }
    .nft-footer {
        display: flex;
        height: 80px;
    }
    .nft-counter {
        border-radius: 0.75rem;
        background-color: white;
        display: flex;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
    }
    .nft-counter p {
        margin: auto auto auto 2rem;
    }
    .nft-counter p strong {
        text: no-wrap;
        font-size: 1.5rem;
        color: #565656;
    }
    .nft-external-link {
        border-radius: 3rem;
        border: unset;
        background-color: white;
        display: flex;
        height: 55px;
        min-width: 55px;
        padding: unset;
        margin-left: 1rem;

        img {
            width: 25px;
            margin: auto;
        }
        :hover {
            background-color: #b6b6b6;
            cursor: pointer;
        }
        :active {
            box-shadow: inset 0 0 3px #000000;
        }
    }
    .mint-button {
        width: 100%;
        height: 3rem;
        border: unset;
        border-radius: 0.75rem;

        display: flex;
        justify-content: center;
        align-items: center;

        color: #565656;

        :hover:not([disabled]) {
            background-color: #b6b6b6;
            cursor: pointer;
        }
        :disabled {
            color: #ffffff;
            :hover {
                cursor: not-allowed;
            }
        }
        :active {
            box-shadow: inset 0 0 3px #ffffff;
        }
    }
    .mint-button img {
        margin: auto 0 auto 1rem;
        width: 1.5rem;
    }
    .mint-button span {
        margin: auto 1rem auto 0.75rem;
        font-size: 1rem;
    }
`

const ErrorTextWrapper = styled.div`
    border-radius: 0.75rem;
    background-color: white;
    min-height: 50px;
    display: flex;

    b {
        font-size: 1.25rem;
        margin: 1rem 2rem;
    }
`

export { MintingPageWrapper, ErrorTextWrapper }

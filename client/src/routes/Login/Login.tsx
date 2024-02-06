import React, { useContext, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import checkAuth, {
    connectWallet,
    decodeToken,
    requestNewToken,
    requestNonce,
    signNonce,
} from 'config/auth'

import logo from 'common/images/logo.png'
import metamaskFox from 'common/images/metamask-fox.png'
import { UserContext } from 'context'
import { LargeSpacer } from 'common/styles/common.styles'

const LoginWrapper = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .logo {
        width: 12rem;
    }
    .login-button {
        width: 100%;
        height: 3rem;
        border: unset;
        border-radius: 1.5rem;

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
        :active:not([disabled]) {
            box-shadow: inset 0 0 3px #000000;
        }
    }
    .login-button img {
        margin: auto 0 auto 1rem;
        width: 1.5rem;
    }
    .login-button span {
        margin: auto 1rem auto 0.75rem;
        font-size: 1rem;
    }
`

export const Login: React.FC = () => {
    const ethereum = (window as any).ethereum
    const navigateTo = useNavigate()

    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)
    const [unauthorized, setUnauthorized] = useState<boolean>(false)

    const [hasMetamask] = useState<boolean>(ethereum?.isMetaMask || false)

    const { publicAddress, setCurrentUser } = useContext(UserContext)
    const { authenticated } = checkAuth(publicAddress)

    const handleAuth = async (): Promise<
        'SUCCESS' | 'UNAUTHORISED' | 'ERROR'
    > => {
        const nonce = await requestNonce(publicAddress!).catch((e) => {
            if (e.request?.status !== 404) throw e
            return undefined
        })
        if (!nonce) {
            return 'UNAUTHORISED'
        }
        const signature = await signNonce(publicAddress!, nonce)
        if (!signature) {
            return 'ERROR'
        }
        const token = await requestNewToken(publicAddress!, signature)
        if (!token) {
            return 'ERROR'
        }

        window.localStorage.setItem('token', token)
        const { user } = decodeToken(token) as any
        setCurrentUser(user)

        return 'SUCCESS'
    }

    const handleClick = async () => {
        if (unauthorized) {
            return
        }
        if (!hasMetamask) {
            window.open('https://metamask.io/')
            return
        }
        if (!publicAddress) {
            await connectWallet()
            return
        }

        setLoading(true)
        try {
            const result = await handleAuth()
            if (result === 'SUCCESS') {
                navigateTo('/~/collections')
            } else if (result === 'UNAUTHORISED') {
                setUnauthorized(true)
            } else if (result === 'ERROR') {
                throw new Error()
            }
        } catch (e) {
            setError(true)
            setTimeout(() => setError(false), 2000)
        } finally {
            setLoading(false)
        }
        return
    }

    const buttonText = useMemo(() => {
        if (loading) return 'Loading...'
        if (error) return 'Error... please try again'
        if (unauthorized) return 'Unauthorized'
        if (publicAddress) return 'Authenticate'
        if (!hasMetamask) return 'Install MetaMask'
        if (hasMetamask) return 'Connect MetaMask'
    }, [loading, error, publicAddress, unauthorized, hasMetamask])

    if (authenticated) {
        return <Navigate replace to="/~/collections" />
    }

    return (
        <LoginWrapper>
            <img className="logo" src={logo} />
            <LargeSpacer />
            <div>
                <button
                    disabled={unauthorized}
                    className="login-button"
                    onClick={handleClick}
                >
                    <img className="metamask-fox" src={metamaskFox} />
                    <span>{buttonText}</span>
                </button>
            </div>
        </LoginWrapper>
    )
}

import { User } from 'context/UserContext'
import jwtDecode from 'jwt-decode'
import axios from './axios'

const connectWallet = async (): Promise<string> => {
    const ethereum = (window as any).ethereum
    return ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((res) => res[0] || '')
}

const requestPublicAddress = async () => {
    const ethereum = (window as any).ethereum
    return ethereum
        ?.request({ method: 'eth_accounts' })
        .then((res: any) => (res || [])[0])
}

const requestNonce = async (publicAddress: string): Promise<string> =>
    axios
        .get(`${process.env.REACT_APP_SERVER_URL}/user/${publicAddress}/nonce`)
        .then((res) => res.data.nonce)

const signNonce = async (
    publicAddress: string,
    nonce: string
): Promise<string> => {
    const ethereum = (window as any).ethereum
    const message = 'Please sign this one-time nonce to log in: ' + nonce
    return ethereum.request({
        method: 'personal_sign',
        params: [message, publicAddress],
    })
}

const requestNewToken = async (
    publicAddress: string,
    signature: string
): Promise<string> => {
    return axios
        .post(`${process.env.REACT_APP_SERVER_URL}/token`, {
            publicAddress,
            signature,
        })
        .then((res) => res.data)
}

const decodeToken = (
    token: string
): { iat: number; exp: number; user: User } | undefined => {
    try {
        const { iat, exp, ...user } = jwtDecode(token) as any
        return { iat, exp, user }
    } catch (e) {
        return undefined
    }
}

const checkAuth = (
    publicAddress: string | undefined
): { authenticated: boolean } => {
    const resetToken = () => localStorage.setItem('token', '')

    const token = localStorage.getItem('token') || ''
    if (!token || !publicAddress) {
        resetToken()
        return { authenticated: false }
    }

    const decoded = decodeToken(token)
    if (!decoded) {
        return { authenticated: false }
    }

    const { exp, user } = decoded
    const dateNow = new Date()

    if (exp < dateNow.getTime() / 1000) {
        resetToken()
        return { authenticated: false }
    } else if (user.publicAddress !== publicAddress) {
        resetToken()
        return { authenticated: false }
    } else {
        return { authenticated: true }
    }
}

export {
    connectWallet,
    requestPublicAddress,
    requestNonce,
    signNonce,
    requestNewToken,
    decodeToken,
}

export default checkAuth

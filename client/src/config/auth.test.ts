import checkAuth, {
    connectWallet,
    requestNewToken,
    requestNonce,
    requestPublicAddress,
    signNonce,
} from './auth'
import axios from './axios'

const mockJwtDecode = jest.fn()
jest.mock('jwt-decode', () => (arg) => mockJwtDecode(arg))

describe('connectWallet', () => {
    let windowSpy: jest.SpyInstance

    beforeEach(() => {
        windowSpy = jest.spyOn(window, 'window', 'get')
    })
    afterEach(() => {
        windowSpy.mockRestore()
    })

    it('should call the request function on ethereum with eth_requestAccounts', async () => {
        const mockRequest = jest.fn(() => Promise.resolve(['connected']))
        windowSpy.mockImplementation(() => ({
            ethereum: {
                request: mockRequest,
            },
        }))

        const result = await connectWallet()

        expect(mockRequest).toHaveBeenCalledWith({
            method: 'eth_requestAccounts',
        })
        expect(result).toEqual('connected')
    })
})

describe('requestPublicAddress', () => {
    let windowSpy: jest.SpyInstance

    beforeEach(() => {
        windowSpy = jest.spyOn(window, 'window', 'get')
    })
    afterEach(() => {
        windowSpy.mockRestore()
    })

    it('should call the request function on ethereum with eth_accounts', async () => {
        const mockRequest = jest.fn(() => Promise.resolve(['publicAddress']))
        windowSpy.mockImplementation(() => ({
            ethereum: {
                request: mockRequest,
            },
        }))

        const result = await requestPublicAddress()

        expect(mockRequest).toHaveBeenCalledWith({
            method: 'eth_accounts',
        })
        expect(result).toEqual('publicAddress')
    })
})

describe('requestNonce', () => {
    let axiosSpy: jest.SpyInstance

    beforeEach(() => {
        axiosSpy = jest.spyOn(axios, 'get')
    })
    afterEach(() => {
        axiosSpy.mockRestore()
    })

    it('should call the get function on axios with the user endpoint and return the nonce', async () => {
        axiosSpy.mockImplementation(() =>
            Promise.resolve({ data: { nonce: 'nonce' } })
        )

        const publicAddress = 'publicAddress'
        const result = await requestNonce(publicAddress)

        expect(axiosSpy).toHaveBeenCalledWith(
            `http://localhost:8080/user/${publicAddress}/nonce`
        )
        expect(result).toEqual('nonce')
    })
})

describe('signNonce', () => {
    let windowSpy: jest.SpyInstance

    beforeEach(() => {
        windowSpy = jest.spyOn(window, 'window', 'get')
    })
    afterEach(() => {
        windowSpy.mockRestore()
    })

    it('should call the request function on ethereum with personal_sign and return the signed nonce', async () => {
        const mockRequest = jest.fn(() => Promise.resolve('signature'))
        windowSpy.mockImplementation(() => ({
            ethereum: {
                request: mockRequest,
            },
        }))

        const nonce = 'ajklsdhfajkshdfsadf'
        const publicAddress = 'publicAddress'
        const result = await signNonce(publicAddress, nonce)

        expect(mockRequest).toHaveBeenCalledWith({
            method: 'personal_sign',
            params: [
                'Please sign this one-time nonce to log in: ' + nonce,
                publicAddress,
            ],
        })
        expect(result).toEqual('signature')
    })
})

describe('requestNewToken', () => {
    let axiosSpy: jest.SpyInstance

    beforeEach(() => {
        axiosSpy = jest.spyOn(axios, 'post')
    })
    afterEach(() => {
        axiosSpy.mockRestore()
    })

    it('should call the post function on axios with the token endpoint and return the token', async () => {
        const token = 'asdlfjsaldf.sdfsdfawfaer.sdfweqdgsdr'
        axiosSpy.mockImplementation(() => Promise.resolve({ data: token }))

        const publicAddress = 'publicAddress'
        const signature = 'signature'
        const result = await requestNewToken(publicAddress, signature)

        expect(axiosSpy).toHaveBeenCalledWith(`http://localhost:8080/token`, {
            publicAddress,
            signature,
        })
        expect(result).toEqual(token)
    })
})

describe('checkAuth', () => {
    const mockGetItem = jest.spyOn(window.localStorage, 'getItem')
    
    const notExpiredDate = new Date(2022, 1, 1)
    jest.useFakeTimers()
    jest.setSystemTime(notExpiredDate)

    beforeEach(() => {
        mockGetItem.mockImplementation(() => 'kjshdfkjsh.sdfssfasdg.crttyvwec')
        mockJwtDecode.mockReturnValue({ exp: notExpiredDate.getTime() / 1000, publicAddress: 'publicAddress' })
    })
    afterEach(() => {
        mockGetItem.mockReset()
        mockJwtDecode.mockRestore()
    })
    it('should return { authenticated: false } if no publicAddress is present', () => {
        const result = checkAuth('')

        expect(mockGetItem).toHaveBeenCalledWith('token')
        expect(result).toEqual({ authenticated: false })
    })
    it('should return { authenticated: false } if no token is present in localStorage', () => {
        mockGetItem.mockImplementation(() => null)
        
        const result = checkAuth('publicAddress')

        expect(mockGetItem).toHaveBeenCalledWith('token')
        expect(result).toEqual({ authenticated: false })
    })
    it('should return { authenticated: false } if token in storage is expired', () => {
        const expiredDate = new Date(2021, 12, 31)
        mockJwtDecode.mockReturnValue({ exp: expiredDate.getTime() / 1000, publicAddress: 'publicAddress' })

        const result = checkAuth('publicAddress')
        
        expect(result).toEqual({ authenticated: false })
    })
    it('should return { authenticated: false } if token in storage contains a public address that does NOT match the current public address', () => {
        const notExpiredDate = new Date(2022, 1, 1)
        mockJwtDecode.mockReturnValue({ exp: notExpiredDate.getTime() / 1000, publicAddress: 'differentPublicAddress' })

        const result = checkAuth('publicAddress')
        
        expect(result).toEqual({ authenticated: false })
    })
    it('should return { authenticated: true } if token in storage contains a public address that matches the current public address AND is not expired', () => {
        const result = checkAuth('publicAddress')
        
        expect(result).toEqual({ authenticated: true })
    })
})

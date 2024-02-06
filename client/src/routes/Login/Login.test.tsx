import { UserContext } from 'context'
import { mount } from 'enzyme'

import Login from '.'
import PrivateRoute from '../../common/components/PrivateRoute'
import * as auth from '../../config/auth'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    Navigate: (props) => {
        mockNavigate(props)
        return <div>Mock Navigate Component</div>
    },
}))

function tick() {
    return new Promise((resolve) => {
        setTimeout(resolve, 0)
    })
}

describe('Login', () => {
    const authSpy = jest.spyOn(auth, 'default')
    Object.defineProperty(window, 'ethereum', {
        value: {
            isMetaMask: true,
        },
        configurable: true,
    })

    let currentUser = undefined;
    const setCurrentUser = (user) => {
        currentUser = user;
    }

    beforeEach(() => {
        authSpy.mockReturnValue({ authenticated: false })
    })
    afterEach(() => {
        authSpy.mockReset()
    })

    it('should render logo and button', () => {
        const wrapper = mount(<Login />)

        expect(wrapper.find({ className: 'logo' }).length).toBe(1)
        expect(wrapper.find({ className: 'logo' }).type()).toBe('img')
        expect(wrapper.find({ className: 'login-button' }).length).toBe(1)
        expect(wrapper.find({ className: 'login-button' }).type()).toBe(
            'button'
        )
    })
    it('should render Install MetaMask button text if user does NOT have MetaMask installed', () => {
        ;(window as any).ethereum.isMetaMask = false

        const wrapper = mount(<Login />)

        expect(
            wrapper.find({ className: 'login-button' }).find('span').text()
        ).toEqual('Install MetaMask')
        ;(window as any).ethereum.isMetaMask = true
    })
    it('should render Connect MetaMask button text if user does have MetaMask installed', () => {
        const wrapper = mount(<Login />)

        expect(
            wrapper.find({ className: 'login-button' }).find('span').text()
        ).toEqual('Connect MetaMask')
    })
    it('should render Authenticate button text if users MetaMask wallet is connected', () => {
        const wrapper = mount(
            <UserContext.Provider value={{ publicAddress: 'publicAddress', currentUser, setCurrentUser }}>
                <Login />
            </UserContext.Provider>
        )

        expect(
            wrapper.find({ className: 'login-button' }).find('span').text()
        ).toEqual('Authenticate')
    })
    it('should render Unauthorized button text if users MetaMask wallet is connected but have failed authentication', async () => {
        jest.spyOn(auth, 'requestNonce').mockResolvedValue('')
        const wrapper = mount(
            <UserContext.Provider value={{ publicAddress: 'publicAddress', currentUser, setCurrentUser }}>
                <Login />
            </UserContext.Provider>
        )

        wrapper.find({ className: 'login-button' }).simulate('click')
        await tick();

        expect(
            wrapper.find({ className: 'login-button' }).find('span').text()
        ).toEqual('Unauthorized')
    })
    it('should render Error button text if page is in error state', async () => {
        jest.spyOn(auth, 'requestNonce').mockResolvedValue('nonce')
        jest.spyOn(auth, 'signNonce').mockResolvedValue('')
        const wrapper = mount(
            <UserContext.Provider value={{ publicAddress: 'publicAddress', currentUser, setCurrentUser }}>
                <Login />
            </UserContext.Provider>
        )

        wrapper.find({ className: 'login-button' }).simulate('click')
        await tick();

        expect(
            wrapper.find({ className: 'login-button' }).find('span').text()
        ).toEqual('Error... please try again')
    })
    it('should render Loading button text if page is in loading state', () => {
        const wrapper = mount(
            <UserContext.Provider value={{ publicAddress: 'publicAddress', currentUser, setCurrentUser }}>
                <Login />
            </UserContext.Provider>
        )

        wrapper.find({ className: 'login-button' }).simulate('click')

        expect(
            wrapper.find({ className: 'login-button' }).find('span').text()
        ).toEqual('Loading...')
    })
    it('should redirect to root page if returnAuth returns false', () => {
        const ElementToRender = () => {
            return <></>
        }
        authSpy.mockReturnValueOnce({ authenticated: false })

        const wrapper = mount(<PrivateRoute element={ElementToRender} roles={['COLLECTION_OWNER']} />)

        expect(wrapper.find(ElementToRender).exists()).toBe(false)
        expect(wrapper.text()).toContain('Mock Navigate Component')
        expect(mockNavigate).toHaveBeenCalledWith({ replace: true, to: '/' })
    })
})

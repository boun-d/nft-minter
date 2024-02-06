import { mount } from 'enzyme'

import PrivateRoute from './PrivateRoute'
import * as auth from '../../config/auth'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Navigate: (props) => {
        mockNavigate(props)
        return <div>Mock Navigate Component</div>
    },
}))

describe('PrivateRoute', () => {
    const ElementToRender = () => {
        return <></>
    }

    const authSpy = jest.spyOn(auth, 'default')
    const authDecodeSpy = jest.spyOn(auth, 'decodeToken')

    afterEach(() => {
        mockNavigate.mockReset()
    })

    it('should render element prop if returnAuth returns true', () => {
        authSpy.mockReturnValueOnce({ authenticated: true })
        authDecodeSpy.mockReturnValueOnce({
            iat: 1665495163,
            exp: 1665509563,
            user: {
                walletOwner: 'Jun Cao',
                publicAddress: '0x4d93739a80dc9e090ac0dfe64dada7726ad0a357',
                role: 'COLLECTION_OWNER',
            }
        })
        const wrapper = mount(<PrivateRoute element={ElementToRender} roles={['COLLECTION_OWNER']} />);

        expect(wrapper.find(ElementToRender).exists()).toBe(true)
        expect(mockNavigate).not.toHaveBeenCalled()
    })
    it('should redirect to root page if returnAuth returns false', () => {
        authSpy.mockReturnValueOnce({ authenticated: false })

        const wrapper = mount(<PrivateRoute element={ElementToRender} roles={['COLLECTION_OWNER']} />)

        expect(wrapper.find(ElementToRender).exists()).toBe(false)
        expect(wrapper.text()).toContain('Mock Navigate Component')
        expect(mockNavigate).toHaveBeenCalledWith({ replace: true, to: '/' })
    })
    it('should redirect to root page if decodeToken failed', () => {
        authSpy.mockReturnValueOnce({ authenticated: true })
        authDecodeSpy.mockReturnValueOnce(undefined)

        const wrapper = mount(<PrivateRoute element={ElementToRender} roles={['COLLECTION_OWNER']} />)

        expect(wrapper.find(ElementToRender).exists()).toBe(false)
        expect(wrapper.text()).toContain('Mock Navigate Component')
        expect(mockNavigate).toHaveBeenCalledWith({ replace: true, to: '/' })
    })
    it('should redirect to collections page if user role is not permitted', () => {
        authSpy.mockReturnValueOnce({ authenticated: true })
        authDecodeSpy.mockReturnValueOnce({
            iat: 1665495163,
            exp: 1665509563,
            user: {
                walletOwner: 'Jun Cao',
                publicAddress: '0x4d93739a80dc9e090ac0dfe64dada7726ad0a357',
                role: 'COLLECTION_OWNER',
            }
        })

        const wrapper = mount(<PrivateRoute element={ElementToRender} roles={['ADMIN']} />)

        expect(wrapper.find(ElementToRender).exists()).toBe(false)
        expect(wrapper.text()).toContain('Mock Navigate Component')
        expect(mockNavigate).toHaveBeenCalledWith({ replace: true, to: '/~/collections' })
    })
})

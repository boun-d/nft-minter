import { UserContext } from 'context'
import type { User } from 'context/UserContext'
import { mount } from 'enzyme'

import { Button } from 'antd'
import Collections from '.'
import { SignedInAsBanner } from './components/SignedInAsBanner'
import { CollectionOverview } from './components/CollectionOverview'
import { AddOwner } from './components/AddOwner'
import { MintingPageURL } from './components/MintingPageURL'
import LoadingPage from 'common/components/LoadingPage'
import ErrorModal from 'common/components/ErrorModal'
import ErrorPage from 'common/components/ErrorPage'

const mockNavigate = jest.fn()
const mockLocation = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: () => mockLocation(),
    useNavigate: () => mockNavigate,
    Navigate: (props) => {
        mockNavigate(props)
        return <div>Mock Navigate Component</div>
    },
}))

const mockUseQuery = jest.fn()

jest.mock('react-query', () => ({
    ...jest.requireActual('react-query'),
    useQuery: () => mockUseQuery()
}))

function tick(time: number = 0) {
    return new Promise((resolve) => {
        setTimeout(resolve, time)
    })
}

describe('Collections', () => {
    const mockCurrentUserWithData: User = {
        walletOwner: '',
        publicAddress: '',
        role: 'COLLECTION_OWNER'
    }
    let currentUser = undefined;
    const setCurrentUser = (user) => {
        currentUser = user;
    }

    beforeEach(() => {
        mockUseQuery.mockReturnValue({
            isLoading: false,
            isError: false,
            data: []
        })
        mockLocation.mockReturnValue({
            state: undefined
        })
    })
    afterEach(() => {
        mockUseQuery.mockReset()
        mockLocation.mockReset()
    })

    it('should render LoadingPage if isLoading is true', () => {
        mockUseQuery.mockReturnValue({
            isLoading: true,
            isError: false,
            data: []
        })
        const wrapper = mount(<Collections />)

        expect(wrapper.find(LoadingPage).exists()).toBe(true)
    })
    it('should render ErrorModal if isLoading is false and isError is true', () => {
        mockUseQuery.mockReturnValueOnce({
            isLoading: false,
            isError: true,
            data: []
        })
        const wrapper = mount(<Collections />)

        expect(wrapper.find(ErrorModal).exists()).toBe(true)
    })
    it('should render "Home" button if there is no initSelectedCollectionId', () => {
        const wrapper = mount(
            <UserContext.Provider value={{ publicAddress: 'publicAddress', currentUser, setCurrentUser }}>
                <Collections />
            </UserContext.Provider>
          )
        
          expect(wrapper.find('.nav-button').length).toBe(1)
          expect(wrapper.find('.nav-button').text()).toEqual('Home')
    })
    it('should render "Go home" button if there is initSelectedCollectionId', () => {
        mockLocation.mockReturnValueOnce({
            state: {
                collectionId: 'mockInitCollectionId'
            }
        })
        const wrapper = mount(
            <UserContext.Provider value={{ publicAddress: 'publicAddress', currentUser, setCurrentUser }}>
                <Collections />
            </UserContext.Provider>
          )
        
          expect(wrapper.find('.nav-button').length).toBe(1)
          expect(wrapper.find('.nav-button').text()).toEqual('Go home')
    })
    it('should render "Create a collection" button if currentUser\'s type is COLLECTION_OWNER', () => {
        const wrapper = mount(
            <UserContext.Provider value={{ publicAddress: 'publicAddress', currentUser: mockCurrentUserWithData, setCurrentUser }}>
                <Collections />
            </UserContext.Provider>
          )
        
          expect(wrapper.find('.role-button').length).toBe(1)
    })

    it('should render "All collections" h2 if currentUser\'s type is not COLLECTION_OWNER', () => {
        const wrapper = mount(
            <UserContext.Provider value={{ publicAddress: 'publicAddress', currentUser, setCurrentUser }}>
                <Collections />
            </UserContext.Provider>
          )
        
          expect(wrapper.find('h2').at(0).text()).toEqual('All collections')
    })
    it('should render "Your collections" h2 if currentUser\'s type is COLLECTION_OWNER', () => {
        const wrapper = mount(
            <UserContext.Provider value={{ publicAddress: 'publicAddress', currentUser: mockCurrentUserWithData, setCurrentUser }}>
                <Collections />
            </UserContext.Provider>
          )
        
          expect(wrapper.find('h2').at(0).text()).toEqual('Your collections')
    })

    it('should render correct amount of collections', () => {
        const mockData = [
            {
                collectionId: 1,
                collectionName: 'collectionName1'
            },
            {
                collectionId: 2,
                collectionName: 'collectionName2'
            },
        ]

        mockUseQuery.mockReturnValue({
            isLoading: false,
            isError: false,
            data: mockData
        })
        const wrapper = mount(<Collections />)
        
        expect(wrapper.find('li').length).toBe(mockData.length)
    })
    it('only one collection should be selected at the same time and the selected collection is the one which has been clicked', async () => {
        const mockData = [
            {
                collectionId: 1,
                collectionName: 'collectionName1'
            },
            {
                collectionId: 2,
                collectionName: 'collectionName2'
            },
        ]
        mockUseQuery.mockReturnValue({
            isLoading: false,
            isError: false,
            data: mockData
        })

        const wrapper = mount(<Collections />)
        
        expect(wrapper.find('li').length).toBe(mockData.length)


        wrapper.find('li').at(0).simulate('click');
        await tick()
        expect(wrapper.find('li.selected').length).toBe(1)
        expect(wrapper.find('li').at(0).hasClass('selected')).toBe(true)

        wrapper.find('li').at(1).simulate('click');
        await tick()
        expect(wrapper.find('li.selected').length).toBe(1)
        expect(wrapper.find('li').at(0).hasClass('selected')).toBe(false)
        expect(wrapper.find('li').at(1).hasClass('selected')).toBe(true)
    })

    it('should render CollectionOverview if there is initSelectedCollectionId', () => {
        mockLocation.mockReturnValueOnce({
            state: {
                collectionId: 'mockInitCollectionId'
            }
        })
        const wrapper = mount(
            <UserContext.Provider value={{ publicAddress: 'publicAddress', currentUser, setCurrentUser }}>
                <Collections />
            </UserContext.Provider>
          )
        
        expect(wrapper.find(CollectionOverview).length).toBe(1);
    })
    it('should render AddOwner if there is no initSelectedCollectionId and user role is ADMIN', () => {
        const mockCurrentUser: User = {
            walletOwner: '',
            publicAddress: '',
            role: 'ADMIN'
        }
        mockLocation.mockReturnValueOnce({ state: {} })
        const wrapper = mount(
            <UserContext.Provider value={{ publicAddress: 'publicAddress', currentUser: mockCurrentUser, setCurrentUser }}>
                <Collections />
            </UserContext.Provider>
          )
        
        expect(wrapper.find(AddOwner).length).toBe(1);
    })
    it('should not render AddOwner if there is no initSelectedCollectionId and user role is not ADMIN', () => {
        mockLocation.mockReturnValueOnce({ state: {} })
        const wrapper = mount(
            <UserContext.Provider value={{ publicAddress: 'publicAddress', currentUser, setCurrentUser }}>
                <Collections />
            </UserContext.Provider>
          )
        
        expect(wrapper.find(AddOwner).length).toBe(0);
    })
})

describe('SignedInAsBanner', () => {
    const mockCurrentUserWithData: User = {
        walletOwner: 'Jun Cao',
        publicAddress: '',
        role: 'COLLECTION_OWNER'
    }
    const setCurrentUser = () => {}

    beforeEach(() => {
    })
    afterEach(() => {
    })

    it('should render correct walletOwner', () => {
        mockUseQuery.mockReturnValue({
            isLoading: true,
            isError: false,
            data: []
        })
        const wrapper = mount(
            <UserContext.Provider value={{ publicAddress: 'publicAddress', currentUser: mockCurrentUserWithData, setCurrentUser }}>
                <SignedInAsBanner />
            </UserContext.Provider>
        )

        expect(wrapper.find('h2').text()).toEqual('Signed in as : Jun Cao')
    })
})

describe('CollectionOverview', () => {
    const mockCurrentUserWithData: User = {
        walletOwner: '',
        publicAddress: '',
        role: 'COLLECTION_OWNER'
    }
    let currentUser = undefined;
    const setCurrentUser = (user) => {
        currentUser = user;
    }

    beforeEach(() => {
        mockUseQuery.mockReturnValue({
            isLoading: false,
            isError: false,
            data: []
        })
        mockLocation.mockReturnValue({
            state: undefined
        })
    })
    afterEach(() => {
        mockUseQuery.mockReset()
        mockLocation.mockReset()
    })

    it('should render LoadingPage if isLoading is true', () => {
        mockUseQuery.mockReturnValue({
            isLoading: true,
            isError: false,
            data: []
        })
        const wrapper = mount(<CollectionOverview collectionId='mockCollectionId' />)

        expect(wrapper.find(LoadingPage).exists()).toBe(true)
    })
    it('should render ErrorPage if isLoading is false and isError is true', () => {
        mockUseQuery.mockReturnValueOnce({
            isLoading: false,
            isError: true,
            data: [],
            refetch: () => {}
        })
        const wrapper = mount(<CollectionOverview collectionId='mockCollectionId' />)

        expect(wrapper.find(ErrorPage).exists()).toBe(true)
    })
})

describe('MintingPageURL', () => {
    const navigatorSpy: jest.SpyInstance = jest.spyOn(window, 'navigator', 'get')

    beforeEach(() => {
        navigatorSpy.mockImplementation(() => ({
            clipboard: {
                writeText: () => {}
            }
        }))
    })
    afterEach(() => {
    })

    it('should render Copy link button text if initial', async () => {
        const wrapper = mount(<MintingPageURL collectionId='mockCollectionId' />)

        expect(wrapper.find(Button).text()).toBe('Copy link')
    })
    it('should render Copied! button text if button has been clicked', async () => {
        const wrapper = mount(<MintingPageURL collectionId='mockCollectionId' />)

        expect(wrapper.find(Button).text()).toBe('Copy link')

        wrapper.find(Button).simulate('click')
        await tick()
        expect(wrapper.find(Button).text()).toBe('Copied!')
    })
    it('should render Copy link button text if button has been clicked after 1s', async () => {
        const wrapper = mount(<MintingPageURL collectionId='mockCollectionId' />)

        expect(wrapper.find(Button).text()).toBe('Copy link')

        wrapper.find(Button).simulate('click')
        await tick(1000)
        expect(wrapper.find(Button).text()).toBe('Copy link')
    })

    it('should render link with collectionId', async () => {
        const wrapper = mount(<MintingPageURL collectionId='mockCollectionId' />)

        expect(wrapper.find('a').text()).toBe(`https://some-dns-site.com/collection/mockCollectionId`)
    })
})

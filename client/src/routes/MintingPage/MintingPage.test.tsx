import { UserContext } from 'context'
import { mount, shallow } from 'enzyme'

import MintingPageContainer from '.'
import { InnerMintingPage } from './MintingPage'
import { ErrorTextWrapper } from './page.styles'

import { LoadingSpinner } from 'common/components/LoadingSpinner'
import placeholderGif from 'common/images/minting-page-placeholder.gif'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    Navigate: (props) => {
        mockNavigate(props)
        return <div>Mock Navigate Component</div>
    },
}))

const mockRefetch = jest.fn()
const mockUseQuery = jest.fn()

jest.mock('react-query', () => ({
    ...jest.requireActual('react-query'),
    useQuery: () => mockUseQuery()
}))

function tick() {
    return new Promise((resolve) => {
        setTimeout(resolve, 0)
    })
}

describe('MintingPageContainer', () => {
    it('should render LoadingSpinner when page is loading', () => {
        mockUseQuery.mockReturnValue({
            isLoading: true,
            isError: false,
            data: {},
            refetch: mockRefetch
        })

        const wrapper = mount(<MintingPageContainer />)

        expect(wrapper.find(LoadingSpinner).length).toBe(1)
    })
    it('should render ErrorTextWrapper when page is error', () => {
        mockUseQuery.mockReturnValue({
            isLoading: false,
            isError: true,
            data: {},
            refetch: mockRefetch
        })

        const wrapper = mount(<MintingPageContainer />)

        expect(wrapper.find(ErrorTextWrapper).length).toBe(1)
    })
    it('should render InnerMintingPage when page is ok', () => {
        mockUseQuery.mockReturnValue({
            isLoading: false,
            isError: false,
            data: {},
            refetch: mockRefetch
        })

        const wrapper = mount(<MintingPageContainer />)

        expect(wrapper.find(InnerMintingPage).length).toBe(1)
    })
})

describe('MintingPage', () => {
    const mockData = {
        collectionName: 'mockCollectionName',
        collectionSize: 'mockCollectionSize',
        gifDirectoryHash: 'mockGifDirectoryHash',
        website: 'mockWebsite',
    }

    it('should render correct collectionName', () => {
        const wrapper = shallow(<InnerMintingPage data={mockData} />)

        const TitleNode = wrapper.find('.title').find('b')
        expect(TitleNode.length).toBe(1)
        expect(TitleNode.text()).toBe(mockData.collectionName)
    })
    it('should render placeholderGif if there is no gifDirectoryHash', () => {
        const mockDataNoGif = {
            collectionName: 'mockCollectionName',
            collectionSize: 'mockCollectionSize',
            gifDirectoryHash: '',
            website: 'mockWebsite',
        }
        const wrapper = shallow(<InnerMintingPage data={mockDataNoGif} />)

        const ImageNode = wrapper.find('.gif').find('img')
        expect(ImageNode.length).toBe(1)
        expect(ImageNode.getElement().props.src).toBe(placeholderGif)
    })
    it('should render correct gif if data contains gifDirectoryHash', () => {
        const wrapper = shallow(<InnerMintingPage data={mockData} />)

        const ImageNode = wrapper.find('.gif').find('img')
        expect(ImageNode.length).toBe(1)
        expect(ImageNode.getElement().props.src).toBe(`https://mock-gateway/ipfs/${mockData.gifDirectoryHash}`)
    })
    it('should render correct nft-counter of data', () => {
        const wrapper = shallow(<InnerMintingPage data={mockData} />)

        const ImageNode = wrapper.find('.nft-counter').find('span')
        expect(ImageNode.length).toBe(1)
        expect(ImageNode.text()).toBe(` of ${mockData.collectionSize} remaining`)
    })
    it('should not render nft-external-link butto if there is no website', async () => {
        const mockDataNoWebsite = {
            collectionName: 'mockCollectionName',
            collectionSize: 'mockCollectionSize',
            gifDirectoryHash: '',
            website: '',
        }
        const wrapper = shallow(<InnerMintingPage data={mockDataNoWebsite} />)

        const Node = wrapper.find('.nft-external-link')
        expect(Node.length).toBe(0)
    })
    it('should render nft-external-link button and open correct url when it has been clicked', async () => {
        const windowOpenSpy = jest.fn()
        const urlSpy = jest.spyOn(window, 'open')
        urlSpy.mockImplementation(windowOpenSpy)
    
        const wrapper = shallow(<InnerMintingPage data={mockData} />)

        const Node = wrapper.find('.nft-external-link')
        expect(Node.length).toBe(1)
        Node.simulate('click')
        await tick()

        expect(windowOpenSpy).toBeCalledWith(mockData.website)
    })
})

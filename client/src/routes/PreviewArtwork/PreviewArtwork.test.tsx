import { mount, shallow } from 'enzyme'

import PreviewArtwork from '.'
import { InnerPreviewArtwork } from './PreviewArtwork'
import {
    LoadingModal,
    ErrorModal,
    ProcessingStatusModal,
    UploadingStatusModal
} from './components/StatusModals'
import * as auth from '../../config/auth'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    Navigate: (props) => {
        mockNavigate(props)
        return <div>Mock Navigate Component</div>
    },
    useParams: () => ({ collectionId: 'mockCollectionId' })
}))

const mockRefetch = jest.fn()
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

describe('PreviewArtworkContainer', () => {
    const authSpy = jest.spyOn(auth, 'default')
    Object.defineProperty(window, 'ethereum', {
        value: {
            isMetaMask: true,
        },
        configurable: true,
    })

    afterEach(() => {
        authSpy.mockReset()
    })

    it('should render ErrorModal when query error', () => {
        mockUseQuery.mockReturnValue({
            isLoading: false,
            isError: true,
            data: 'NOT_CREATED',
            refetch: mockRefetch
        })
        const wrapper = mount(<PreviewArtwork />)

        expect(wrapper.find(ErrorModal).length).toBe(1)
    })
    it('should render LoadingModal when page is loading', () => {
        const mockRefetch = jest.fn()
        mockUseQuery.mockReturnValue({
            isLoading: true,
            isError: false,
            data: '',
            refetch: mockRefetch
        })
        const wrapper = mount(<PreviewArtwork />)

        expect(wrapper.find(LoadingModal).length).toBe(1)
    })
    it('should render ErrorModal when status is CREATED', () => {
        mockUseQuery.mockReturnValue({
            isLoading: false,
            isError: false,
            data: 'CREATED',
            refetch: mockRefetch
        })
        const wrapper = mount(<PreviewArtwork />)

        expect(wrapper.find(ErrorModal).length).toBe(1)
    })
    it('should render ProcessingStatusModal when status is PROCESSING', () => {
        mockUseQuery.mockReturnValue({
            isLoading: false,
            isError: false,
            data: 'PROCESSING',
            refetch: mockRefetch
        })
        const wrapper = mount(<PreviewArtwork />)

        expect(wrapper.find(ProcessingStatusModal).length).toBe(1)
    })
    it('should render UploadingStatusModal when status is UPLOADING', () => {
        mockUseQuery.mockReturnValue({
            isLoading: false,
            isError: false,
            data: 'UPLOADING',
            refetch: mockRefetch
        })
        const wrapper = mount(<PreviewArtwork />)

        expect(wrapper.find(UploadingStatusModal).length).toBe(1)
    })
    it('should render ErrorModal when status is not matched', () => {
        mockUseQuery.mockReturnValue({
            isLoading: false,
            isError: false,
            data: 'OTHER_STATUS',
            refetch: mockRefetch
        })
        const wrapper = mount(<PreviewArtwork />)

        expect(wrapper.find(ErrorModal).length).toBe(1)
    })
})

describe('InnerPreviewArtwork', () => {
    const mockSetContractFields = jest.fn()
    const mockRefetchCollectionStatus = jest.fn()

    const CommonRenderNode = (
        <InnerPreviewArtwork
            collectionStatus='DEPLOYED'
            setContractFields={mockSetContractFields}
            refetchCollectionStatus={mockRefetchCollectionStatus}
        />
    )

    it('should render ErrorModal when query error', () => {
        mockUseQuery.mockReturnValue({
            isLoading: false,
            isError: true,
            data: [],
            refetch: mockRefetch
        })
        const wrapper = mount(CommonRenderNode)

        expect(wrapper.find(ErrorModal).length).toBe(1)
    })
    it('should render LoadingModal when page is loading', () => {
        const mockRefetch = jest.fn()
        mockUseQuery.mockReturnValue({
            isLoading: true,
            isError: false,
            data: [],
            refetch: mockRefetch
        })
        const wrapper = mount(CommonRenderNode)

        expect(wrapper.find(LoadingModal).length).toBe(1)
    })

    it('should render correct size of images when click view-more button', async () => {
        mockUseQuery.mockReturnValue({
            isLoading: false,
            isError: false,
            data: { collectionSize: 210 },
            refetch: mockRefetch
        })
        const wrapper = mount(CommonRenderNode)

        const ViewMoreButton = wrapper.find({ id: 'view-more-images' })
        
        expect(wrapper.find('.image-container').length).toBe(100)
        ViewMoreButton.at(0).simulate('click')
        await tick()
        expect(wrapper.find('.image-container').length).toBe(200)
        ViewMoreButton.at(0).simulate('click')
        await tick()
        expect(wrapper.find('.image-container').length).toBe(210)
        expect(wrapper.find({ id: 'view-more-images' }).length).toBe(0)
    })
})

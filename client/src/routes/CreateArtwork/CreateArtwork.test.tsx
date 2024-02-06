import { mount, shallow } from 'enzyme'
import CreateArtwork from '.'
import Layer, { LayerOption, AddLayerOptionButton } from './components/Layer';
import Preview from './components/Preview';
import UploadImagesSection from './components/UploadImagesSection';

import previewPlaceholder from 'common/images/preview-placeholder.png'

const mockUseNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockUseNavigate,
}))

function tick() {
    return new Promise((resolve) => {
        setTimeout(resolve, 0)
    })
}

describe('CreateArtwork', () => {
    it('should not render Layer on init ', async () => {
        const wrapper = mount(<CreateArtwork />)

        expect(wrapper.find(Layer).length).toBe(0);
    })

    it('should render 1 Layer when click layer-button ', async () => {
        const wrapper = mount(<CreateArtwork />)

        wrapper.find({ className: 'layer-button' }).simulate('click')
        await tick();

        expect(wrapper.find(Layer).length).toBe(1);
    })
    

    it('should delete 1 Layer when click layer-delete-button ', async () => {
        const wrapper = mount(<CreateArtwork />)

        wrapper.find({ className: 'layer-button' }).simulate('click')
        await tick();

        wrapper.find({ className: 'layer-delete-button' }).simulate('click')
        await tick();

        expect(wrapper.find(LayerOption).length).toBe(0);
    })

    it('should not render LayerOption when click layer-button ', async () => {
        const wrapper = mount(<CreateArtwork />)

        wrapper.find({ className: 'layer-button' }).simulate('click')
        await tick();

        expect(wrapper.find(LayerOption).length).toBe(0);
    })
})

describe('Layer', () => {        
    const mockImg = new File([], 'test.png', {type: 'image/png'});
    const mockLayer = {
        number: 0,
        name: 'mockLayerName0',
        options: [{
            key: 'mockLayerOptionKey0',
            image: mockImg,
            imageURL: 'mockLayerImageURL0'
        }]
    }

    it('should trigger handleUpdateLayer function when click Add image button and select a image', async () => {
        const mockUpdateLayer = jest.fn()

        const wrapper = mount(
            <Layer
                layer={mockLayer}
                handleUpdateLayer={mockUpdateLayer}
                handleDeleteLayer={() => {}}
            />
        )

        const fileInput = wrapper.find(`#option-image-input-layer-${mockLayer.number}`)
        expect(fileInput.length).toBe(1)
        fileInput.simulate('change', { target: { files: [mockImg] }})

        expect(mockUpdateLayer).toBeCalledTimes(1)
    })
    it('should trigger handleDeleteLayer correctly when click layer-delete-button ', async () => {
        const mockDeleteLayer = jest.fn()
        const wrapper = mount(
            <Layer
                layer={mockLayer}
                handleUpdateLayer={() => {}}
                handleDeleteLayer={mockDeleteLayer}
            />
        )

        const layerDeleteButton = wrapper.find({ className: 'layer-delete-button' })
        expect(layerDeleteButton.length).toBe(1)
        layerDeleteButton.simulate('click')
        await tick();

        expect(mockDeleteLayer).toBeCalledWith(mockLayer.number);
    })
})

describe('AddLayerOptionButton', () => {        
    const mockImg = new File([], 'test.png', {type: 'image/png'});
    const mockLayer = {
        number: 0,
        name: 'mockLayerName',
        options: []
    }

    const urlSpy = jest.spyOn(window.URL, 'createObjectURL')
    urlSpy.mockImplementation(() => 'mockImageURL')

    const mockAddLayerOptions = jest.fn()

    it('should render 1 file input ', async () => {
        const wrapper = mount(
            <AddLayerOptionButton layer={mockLayer} handleAddLayerOptions={mockAddLayerOptions} />
        )

        expect(wrapper.find('input').length).toBe(1);
    })
    it('AddLayerOptions should be called 1 time when select 1 file', async () => {
        const wrapper = mount(
            <AddLayerOptionButton layer={mockLayer} handleAddLayerOptions={mockAddLayerOptions} />
        )

        const inputEle = wrapper.find('#option-image-input-layer-0')
        expect(inputEle.length).toBe(1);

        wrapper.find('#option-image-input-layer-0').simulate('change', { target: { files: [mockImg] }})

        expect(mockAddLayerOptions).toHaveBeenCalled()
        expect(mockAddLayerOptions).toHaveBeenCalledTimes(1)
    })
})

describe('Preview', () => {
    const mockImg = new File([], 'test.png', {type: 'image/png'});

    const mockImages = [{
        image: mockImg,
        imageURL: 'mockImageURL0'
    }]
    
    const mockImages2 = [
        {
            image: mockImg,
            imageURL: 'mockImageURL0'
        },
        {
            image: mockImg,
            imageURL: 'mockImageURL1'
        }
    ]

    const mockLayer = [{
        number: 0,
        name: 'mockLayerName0',
        options: [{
            key: 'mockLayerOptionKey0',
            image: mockImg,
            imageURL: 'mockLayerOptionImageURL0'
        }]
    }]

    it('should render previewPlaceholder if there are no images', async () => {
        const wrapper = mount(<Preview layers={[]} images={[]} />)

        const imgEle = wrapper.find('img')
        expect(imgEle.length).toBe(1);
        expect(imgEle.getElement().props.src).toBe(previewPlaceholder);
    })
    it('should not render previewPlaceholder if there are images', async () => {
        const wrapper = mount(<Preview layers={[]} images={mockImages} />)

        const imgEle = wrapper.find('img')
        expect(imgEle.length).toBe(1);
        expect(imgEle.getElement().props.src).not.toBe(previewPlaceholder);
    })
    it('should not render previewPlaceholder if there are layers', async () => {
        const wrapper = mount(<Preview layers={mockLayer} images={[]} />)

        const imgEle = wrapper.find('img')
        expect(imgEle.length).toBe(1);
        expect(imgEle.getElement().props.src).not.toBe(previewPlaceholder);
    })

    it('should render correct images if there is image', async () => {
        const wrapper = mount(<Preview layers={[]} images={mockImages} />)

        const imgEle = wrapper.find('img')
        expect(imgEle.length).toBe(1);
        expect(imgEle.getElement().props.src).toBe('mockImageURL0');
    })
    it('should render correct images if there are images', async () => {
        const wrapper = mount(<Preview layers={[]} images={mockImages2} />)

        const imgEle = wrapper.find('img')
        expect(imgEle.length).toBe(1);
        expect(imgEle.getElement().props.src).toBe('mockImageURL1');
    })
    it('should render correct layer images if there are layer with images', async () => {
        const wrapper = mount(<Preview layers={mockLayer} images={[]} />)

        const imgEle = wrapper.find('img')
        expect(imgEle.length).toBe(1);
        expect(imgEle.getElement().props.src).toBe('mockLayerOptionImageURL0');
    })
})

describe('UploadImagesSection', () => {
    const mockImg = new File([], 'test.png', {type: 'image/png'});

    const mockImages = [{
        image: mockImg,
        imageURL: 'mockImageURL'
    }]

    const mockHandleAddImages = jest.fn()
    const mockHandleDeleteAllImages = jest.fn()

    const urlSpy = jest.spyOn(window.URL, 'createObjectURL')
    urlSpy.mockImplementation(() => 'mockImageURL')

    it('should not render Remove all button if there are no images', async () => {
        const wrapper = shallow(
            <UploadImagesSection
                images={[]}
                handleAddImages={() => {}}
                handleDeleteAllImages={() => {}}
            />
        )

        expect(wrapper.find({ className: 'images-remove-all' }).length).toBe(0);
    })
    it('should render Remove all button if there are images', async () => {
        const wrapper = shallow(
            <UploadImagesSection
                images={mockImages}
                handleAddImages={() => {}}
                handleDeleteAllImages={() => {}}
            />
        )

        expect(wrapper.find({ className: 'images-remove-all' }).length).toBe(1);
    })
    it('should trigger handleDeleteAllImages when click Remove all button', async () => {
        const wrapper = shallow(
            <UploadImagesSection
                images={mockImages}
                handleAddImages={mockHandleAddImages}
                handleDeleteAllImages={mockHandleDeleteAllImages}
            />
        )

        wrapper.find({ className: 'images-remove-all' }).simulate('click')
        expect(mockHandleDeleteAllImages).toBeCalledTimes(1)
    })
    it('should trigger handleAddImages function when click Add images button and select a image', async () => {
        const wrapper = shallow(
            <UploadImagesSection
                images={mockImages}
                handleAddImages={mockHandleAddImages}
                handleDeleteAllImages={mockHandleDeleteAllImages}
            />
        )

        const fileInput = wrapper.find('#option-image-input')
        expect(fileInput.length).toBe(1)
        fileInput.simulate('change', { target: { files: [mockImg] }})

        expect(mockHandleAddImages).toBeCalledTimes(1)
    })
})

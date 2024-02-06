import React, { useContext, useMemo, useState } from 'react'
import { Button, Input, Form, Alert } from 'antd'
import { Route, RouteContainer } from 'common/components/RouteContainer'
import axios from 'config/axios'
import Layer from './components/Layer'
import './index.css'

import { LargeSpacer, MediumSpacer } from 'common/styles/common.styles'
import {
    getFormDataForGeneratedCollection,
    getFormDataForUploadedCollection,
    MINIMUM_LAYERS,
    MINIMUM_OPTIONS_PER_LAYER,
} from './utils'
import { useNavigate } from 'react-router-dom'
import Preview from './components/Preview'
import UploadImagesSection from './components/UploadImagesSection'
import { UserContext } from 'context'

interface Props {}

export const InnerCreateArtwork: React.FC<Props> = () => {
    const navigateTo = useNavigate()

    const { publicAddress } = useContext(UserContext)

    const [form] = Form.useForm()

    const [layers, setLayers] = useState<Layer[]>([])
    const [images, setImages] = useState<UploadedImage[]>([])

    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [isDisplayRequirementsWarning, setIsDisplayRequirementsWarning] =
        useState<boolean>(false)

    const isEnoughLayersToGenerate: boolean = useMemo(() => {
        const numberOfLayers = layers.length
        if (numberOfLayers < MINIMUM_LAYERS) return false

        return (
            layers.reduce(
                (total, currentLayer) =>
                    currentLayer.options.length < MINIMUM_OPTIONS_PER_LAYER
                        ? total
                        : total + 1,
                0
            ) > 4
        )
    }, [layers])

    const handleAddImages = (files: File[]) => {
        const newImages = files.map((file) => ({
            image: file,
            imageURL: URL.createObjectURL(file),
        }))
        setImages((images) => [...images, ...newImages])
    }

    const handleDeleteAllImages = () => {
        for (const image of images) {
            URL.revokeObjectURL(image.imageURL)
        }
        setImages(() => [])
    }

    const handleAddLayer = () => {
        setLayers((prevLayers) => {
            const layerNumber = layers.length + 1
            const newLayer: Layer = {
                number: layerNumber,
                options: [],
            }
            return [...prevLayers, newLayer]
        })
        setIsDisplayRequirementsWarning(() => false)
    }

    const handleUpdateLayer = async (updatedLayer: Layer) => {
        setLayers((layers) => {
            const newLayers = layers.map((layer) =>
                layer.number === updatedLayer.number ? updatedLayer : layer
            )
            return newLayers
        })
        setIsDisplayRequirementsWarning(() => false)
    }

    const handleDeleteLayer = (layerNumber: number) => {
        setLayers((layers) => {
            const newLayers = layers
                .filter(({ number }) => number !== layerNumber)
                .map((layer, i) => ({
                    ...layer,
                    number: i + 1,
                }))
            return newLayers
        })
        setIsDisplayRequirementsWarning(() => false)
    }

    const handleSubmit = async () => {
        let isError = false

        await form.validateFields().catch(() => isError = true);
        if (layers.length && !isEnoughLayersToGenerate) {
            setIsDisplayRequirementsWarning(() => true)
            isError = true
        }
        if (isError) return;

        try {
            const { collectionName, collectionSize } = form.getFieldsValue()
            setIsLoading(true)

            const collectionId = await axios({
                method: 'post',
                url: `${
                    process.env.REACT_APP_SERVER_URL
                }/collection`,
                data: {
                    collectionName,
                    collectionOwner: publicAddress
                },
            }).then((res) => res.data)

            if (layers.length) {
                const formData = getFormDataForGeneratedCollection(
                    collectionSize,
                    layers
                )
                await axios({
                    method: 'post',
                    url: `${
                        process.env.REACT_APP_SERVER_URL
                    }/collection/${collectionId}/generate-artwork`,
                    data: formData,
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
            }
            if (images.length) {
                const formData = getFormDataForUploadedCollection(
                    images
                )
                await axios({
                    method: 'post',
                    url: `${
                        process.env.REACT_APP_SERVER_URL
                    }/collection/${collectionId}/upload-artwork`,
                    data: formData,
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
            }
            await axios({
                method: 'patch',
                url: `${
                    process.env.REACT_APP_SERVER_URL
                }/collection/${collectionId}/status?queue=true`,
                data: {
                    collectionStatus: 'PROCESSED',
                },
            })

            setIsLoading(false)
            navigateTo(`/~/preview-artwork/${collectionId}`)
        } catch (e) {
            setIsLoading(false)
            console.error(e)
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                padding: '5vw',
                maxWidth: '100vw',
                flexDirection: 'row',
            }}
        >
            <div
                style={{
                    width: '40%',
                    maxWidth: '40%',
                    borderRight: '0.3vw solid #061A2C',
                }}
            >
                <div
                    style={{
                        border: '0.3vw solid rgb(6,26,44)',
                        width: 'calc(40vw - 8rem - 5rem)',
                        height: 'calc(40vw - 8rem - 5rem)',
                        position: 'sticky',
                        top: '30vh',
                    }}
                >
                    <Preview layers={layers} images={images} />
                </div>
            </div>
            <div
                style={{
                    width: '60%',
                    maxWidth: '60%',
                }}
            >
                <Form
                    style={{
                        flex: 1,
                        textAlign: 'left',
                        paddingLeft: '10vw',
                        width: 'fit-content',
                    }}
                    colon={false}
                    labelAlign="left"
                    form={form}
                    requiredMark={false}
                >
                    {/* Layer Image Tab*/}
                    <div className="headers-box">
                        <div className="headers-navy">
                            Generate images using layers
                        </div>
                        <div className="section-break">
                            <span
                                style={{
                                    fontSize: '1.2vw',
                                    color: 'rgb(6,26,44)',
                                    fontWeight: 300,
                                }}
                            >
                                Generated images are created from layers in a
                                back to front approach <br />
                                Layer 1 = Background, Layer 2 = Midground and
                                Layer 3 = Foreground. <br />
                                Each layer also the ability to have multiple
                                options.
                            </span>
                            <MediumSpacer />
                            {layers.map((layer) => (
                                <Layer
                                    layer={layer}
                                    handleUpdateLayer={handleUpdateLayer}
                                    handleDeleteLayer={handleDeleteLayer}
                                    key={layer.number}
                                />
                            ))}
                            <div style={{ textAlign: 'right' }}>
                                <Button
                                    shape="round"
                                    type="primary"
                                    onClick={() => handleAddLayer()}
                                    className="layer-button"
                                    size="large"
                                >
                                    + Add layer
                                </Button>
                            </div>
                            <LargeSpacer />
                            {!!layers.length && (
                                <div>
                                    <Form.Item
                                        label={
                                            <div
                                                style={{
                                                    width: 160,
                                                    fontSize: '1.2vw',
                                                    fontWeight: 400,
                                                    color: 'rgb(6,26,44)',
                                                }}
                                            >
                                                Collection Size:
                                            </div>
                                        }
                                        name="collectionSize"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Please input collection size!',
                                            },
                                        ]}
                                        requiredMark={false}
                                    >
                                        <Input />
                                    </Form.Item>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Image Tab*/}
                    <div className="headers-box">
                        <div className="headers-navy">Upload images</div>
                        <div className="section-break">
                            <UploadImagesSection
                                images={images}
                                handleAddImages={handleAddImages}
                                handleDeleteAllImages={handleDeleteAllImages}
                            />
                        </div>
                    </div>

                    {/* Generate Artwork Tab*/}
                    <div
                        style={{
                            border: '2px solid rgb(6,26,44)',
                            margin: '2vw auto',
                            paddingBottom: 20,
                        }}
                    >
                        <div
                            style={{
                                lineHeight: '5vw',
                                fontSize: '1.4vw',
                                backgroundColor: 'rgb(6,26,44)',
                                color: 'white',
                                textAlign: 'center',
                            }}
                        >
                            Generate collection
                        </div>
                        <div style={{ padding: '2vw 3vw 0 2vw' }}>
                            <div
                                style={{
                                    paddingTop: 10,
                                    fontSize: '1.4vw',
                                    letterSpacing: 1.2,
                                    fontWeight: 500,
                                    color: ' rgb(6,26,44)',
                                }}
                            >
                                <Form.Item
                                    label={
                                        <div
                                            style={{
                                                width: 160,
                                                fontSize: '1.2vw',
                                                fontWeight: 400,
                                                color: 'rgb(6,26,44)',
                                            }}
                                        >
                                            Collection Name:
                                        </div>
                                    }
                                    name="collectionName"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Please input collection name!',
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </div>
                            <div
                                style={{
                                    textAlign: 'right',
                                    marginTop: 20,
                                }}
                            >
                                {isDisplayRequirementsWarning && (
                                    <Alert
                                        message="You will need to provide at least 5 layers with 5 options to continue"
                                        type="warning"
                                        showIcon
                                        style={{
                                            display: 'inline-flex',
                                        }}
                                    />
                                )}
                                <Button
                                    type="primary"
                                    shape="round"
                                    className="button-primary"
                                    size="large"
                                    loading={isLoading}
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    )
}

export const CreateArtworkContainer: React.FC = () => {
    return (
        <RouteContainer route={Route.CREATE_ARTWORK}>
            {() => {
                return <InnerCreateArtwork />
            }}
        </RouteContainer>
    )
}

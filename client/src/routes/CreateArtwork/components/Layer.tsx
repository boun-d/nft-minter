import React, { useEffect, useState } from 'react'
import { Button, Space, Upload, Input, Select, Form } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { uniqueId } from 'lodash'

const ValidateWords = {
    pattern: /[^\W]/,
    message: 'There contains special characters!',
}

interface AddLayerOptionButtonProps {
    layer: Layer
    handleAddLayerOptions: (newLayerOptions: LayerOption[]) => void
}

export const AddLayerOptionButton: React.FC<AddLayerOptionButtonProps> = ({
    layer,
    handleAddLayerOptions,
}) => {
    const handleUploadImages = (files: File[]) => {
        const layerOptions = files.map((file) => {
            const imageURL = URL.createObjectURL(file)
            return {
                key: uniqueId(),
                image: file,
                imageURL,
                rarity: undefined,
                metadata: undefined,
            }
        })
        handleAddLayerOptions(layerOptions)
    }
    return (
        <>
            <input
                type="file"
                id={`option-image-input-layer-${layer.number}`}
                multiple
                accept=".png"
                onChange={(e) => {
                    const files = !!e.target.files
                        ? Array.from(e.target.files)
                        : []
                    handleUploadImages(files)
                }}
                style={{ display: 'none' }}
            />
            <Button
                shape="round"
                type="primary"
                className="option-button"
                onClick={() =>
                    document
                        .getElementById(
                            `option-image-input-layer-${layer.number}`
                        )
                        ?.click()
                }
            >
                + Add option/s
            </Button>
        </>
    )
}

interface LayerOptionProps {
    layerOption: LayerOption
    handleUpdateLayerOption: (updatedLayerOption: LayerOption) => void
    handleDeleteLayerOption: (toBeDeletedLayerOption: LayerOption) => void
}

export const LayerOption: React.FC<LayerOptionProps> = ({
    layerOption,
    handleUpdateLayerOption,
    handleDeleteLayerOption,
}) => {
    const handleUpdate = (name: string, value: string) => {
        const newLayerOption = {
            ...layerOption,
            [name]: value,
        }
        handleUpdateLayerOption(newLayerOption)
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                marginBottom: '2rem',
                width: 'fit-content',
            }}
            key={layerOption.key}
        >
            <div>
                <div>
                    <div
                        style={{
                            width: '12vw',
                            height: '12vw',
                            border: '3px solid rgb(6,26,44)',
                        }}
                    >
                        <img
                            src={layerOption.imageURL}
                            style={{ width: '100%', height: '100%'}}
                        />
                    </div>
                </div>
            </div>
            <div style={{ margin: '0 1rem' }}>
                <Form.Item style={{ textAlign: 'right' }}>
                    <Button
                        className='option-delete-button'
                        onClick={() => handleDeleteLayerOption(layerOption)}
                        icon={<DeleteOutlined className="layer-header__icon" />}
                        type="text"
                        danger
                    ></Button>
                </Form.Item>
                <Form.Item
                    label="Metadata"
                    name={['layerOption', layerOption.key, 'metadata']}
                    rules={[
                        {
                            required: true,
                            message: 'Please enter metadata',
                        },
                        ValidateWords,
                    ]}
                >
                    <Input
                        value={layerOption.metadata}
                        onChange={(e) =>
                            handleUpdate('metadata', e.target.value)
                        }
                    />
                </Form.Item>
                <Form.Item
                    name={['layerOption', layerOption.key, 'rarity']}
                    label="Rarity"
                    rules={[
                        {
                            required: true,
                            message: 'Please Select Rarity',
                        },
                    ]}
                >
                    <Select
                        value={layerOption.rarity}
                        onChange={(value) => handleUpdate('rarity', value)}
                        getPopupContainer={(trigger) => trigger}
                    >
                        <Select.Option value="b">Basic</Select.Option>
                        <Select.Option value="l">Low</Select.Option>
                        <Select.Option value="m">Medium</Select.Option>
                        <Select.Option value="r">Rare</Select.Option>
                        <Select.Option value="sr">Super Rare</Select.Option>
                    </Select>
                </Form.Item>
            </div>
        </div>
    )
}

interface LayerProps {
    layer: Layer
    handleUpdateLayer: (updatedLayer: Layer) => void
    handleDeleteLayer: (layerNumber: number) => void
}

const Layer: React.FC<LayerProps> = ({
    layer,
    handleUpdateLayer,
    handleDeleteLayer,
}) => {
    const { number, name, options } = layer

    const handleUpdateName = (name: string) => {
        const newLayer = {
            ...layer,
            name,
        }
        handleUpdateLayer(newLayer)
    }

    const handleAddLayerOptions = (newLayerOptions: LayerOption[]) => {
        handleUpdateLayer({
            ...layer,
            options: [...layer.options, ...newLayerOptions],
        })
    }

    const handleUpdateLayerOption = (updatedLayerOption: LayerOption) => {
        const newLayerOptions = layer.options.map((layerOption) =>
            layerOption.key === updatedLayerOption.key
                ? updatedLayerOption
                : layerOption
        )
        handleUpdateLayer({ ...layer, options: newLayerOptions })
    }

    const handleDeleteLayerOption = (toBeDeletedLayerOption: LayerOption) => {
        URL.revokeObjectURL(toBeDeletedLayerOption.imageURL)
        const newLayerOptions = layer.options.filter(
            ({ key }) => key !== toBeDeletedLayerOption.key
        )
        handleUpdateLayer({ ...layer, options: newLayerOptions })
    }

    return (
        <>
            <div
                style={{
                    border: '2px solid rgb(6,26,44)',
                    marginBottom: '2rem',
                }}
            >
                <div className="layer-header">
                    <Space align="center">
                        <span>Layer {number}</span>
                    </Space>
                    <Button
                        size="large"
                        className='layer-delete-button'
                        icon={<DeleteOutlined className="layer-header__icon" />}
                        type="text"
                        danger
                        onClick={() => handleDeleteLayer(layer.number)}
                    />
                </div>
                <div style={{ padding: '2vw 2.5vw' }}>
                    <span className="layer-name">Layer name</span>
                    <Form.Item
                        name={['layer', layer.number, 'name']}
                        rules={[
                            {
                                required: true,
                                message: 'Please provide layer name',
                            },
                        ]}
                        style={{ marginBottom: '2vw' }}
                    >
                        <Input
                            value={layer.name}
                            onChange={(e) => handleUpdateName(e.target.value)}
                            placeholder="e.g. 'Hats' or 'Glasses'"
                            size="large"
                        />
                    </Form.Item>
                    {layer.options.map((layerOption, i) => (
                        <LayerOption
                            layerOption={layerOption}
                            handleUpdateLayerOption={handleUpdateLayerOption}
                            handleDeleteLayerOption={handleDeleteLayerOption}
                            key={i}
                        />
                    ))}
                    <div style={{ textAlign: 'right' }}>
                        <AddLayerOptionButton
                            layer={layer}
                            handleAddLayerOptions={handleAddLayerOptions}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Layer

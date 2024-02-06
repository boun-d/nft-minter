import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, Input, Button, FormInstance, InputNumber } from 'antd'
import { ethers } from 'ethers'
import axios from 'config/axios'

import factoryABI from 'contract/factoryABI.json'

import Modal from 'common/components/Modal'
import {
    FillSeperator,
    MediumSpacer,
    SmallSpacer,
} from 'common/styles/common.styles'

interface ConfigureWhitelistProps {
    form: FormInstance
}

export const ConfigureWhitelist: React.FC<ConfigureWhitelistProps> = ({
    form,
}) => {
    const [csvError, setCsvError] = useState<boolean>()

    const handleFileInput = (file: File) => {
        const reader = new FileReader()

        if (!file) return setCsvError(true)

        reader.onload = async (e) => {
            if (!e.target?.result || typeof e.target.result !== 'string') {
                setTimeout(() => setCsvError(false), 2000)
                return setCsvError(true)
            }

            const addresses = e.target.result.split('\r\n')
            form.setFieldValue('whitelist', addresses.join('\n'))
        }
        reader.readAsText(file)
    }

    return (
        <>
            <input
                type="file"
                id="select-csv-input"
                accept=".csv"
                onChange={(e) => {
                    const files = !!e.target.files
                        ? Array.from(e.target.files)
                        : []
                    handleFileInput(files[0])
                }}
                style={{ display: 'none' }}
            />
            <label style={{ fontSize: '1.2vw', display: 'inline-block' }}>
                Whitelisted wallets:
            </label>
            <Button
                shape="round"
                type="primary"
                className="layer-button"
                onClick={() =>
                    document.getElementById(`select-csv-input`)?.click()
                }
                size="small"
                style={{
                    float: 'right',
                }}
            >
                {csvError ? 'Invalid CSV file' : 'Import using CSV file'}
            </Button>
            <SmallSpacer />
            <Form.Item
                name="whitelist"
                style={{ marginBottom: '0.75rem', fontFamily: 'monospace' }}
                rules={[
                    {
                        pattern: new RegExp(
                            /^((0x[a-fA-F0-9]{40})(\n0x[a-fA-F0-9]{40})*)?$/
                        ),
                        message: '',
                    },
                ]}
            >
                <Input.TextArea placeholder="Whitelisted wallets must be seperated with new lines" />
            </Form.Item>
        </>
    )
}

export const DeployContractModal: React.FC = () => {
    const ethereum = (window as any).ethereum
    const { collectionId } = useParams<{ collectionId: string }>()
    const navigateTo = useNavigate();

    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)
    const [form] = Form.useForm()

    const handleSubmit = async () => {
        try {
            await form.validateFields()
            setLoading(true)
            const {
                whitelist,
                firstRoyaltyWallet,
                firstRoyaltyPercentage,
                secondRoyaltyWallet,
                secondRoyaltyPercentage,
            } = form.getFieldsValue()
            const whitelistedWallets = (whitelist?.split('\n') || []).filter(
                Boolean
            )

            const response = await axios({
                method: 'get',
                url: `${process.env.REACT_APP_SERVER_URL}/collection/${collectionId}`,
            })

            if (response.status !== 200)
                throw new Error('Could not retrieve collection')

            if (!process.env.REACT_APP_FACTORY_CONTRACT_ADDRESS)
                throw new Error('Factory contract address not defined')

            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(
                process.env.REACT_APP_FACTORY_CONTRACT_ADDRESS,
                factoryABI,
                signer
            )

            const transaction = await contract.newCollection(
                response.data.collectionName,
                response.data.collectionSize,
                firstRoyaltyWallet,
                firstRoyaltyPercentage,
                secondRoyaltyWallet ||
                    '0x0000000000000000000000000000000000000000',
                secondRoyaltyPercentage,
                response.data.jsonFilesDirectoryHash,
                whitelistedWallets || []
            )
            const result = await transaction.wait()

            const contractAddress = result.events.find(
                ({ event }) => event === 'CollectionCreated'
            ).args[0]

            await axios({
                method: 'post',
                url: `${process.env.REACT_APP_SERVER_URL}/collection/${collectionId}/contract-address`,
                data: {
                    contractAddress,
                },
            })
            await axios({
                method: 'patch',
                url: `${
                    process.env.REACT_APP_SERVER_URL
                }/collection/${collectionId}/status`,
                data: {
                    collectionStatus: 'DEPLOYED',
                },
            })
            setLoading(false)
            navigateTo('/~/collections', { state: { collectionId }})
        } catch (e) {
            console.warn(e)
            setError(true)
            setTimeout(() => setError(false), 2000)
            setLoading(false)
        }
    }

    return (
        <Modal title="Step 2 - Deploy the smart contract">
            <Form
                style={{
                    flex: 1,
                    textAlign: 'left',
                    padding: '0 3rem',
                }}
                colon={false}
                labelAlign="left"
                form={form}
                requiredMark={false}
                initialValues={{
                    firstRoyaltyPercentage: 0,
                    secondRoyaltyPercentage: 0,
                }}
            >
                <Form.Item label="Network:" name="network">
                    <Input defaultValue="Ethereum Mainnet" disabled />
                </Form.Item>
                <ConfigureWhitelist form={form} />
                <SmallSpacer />
                <label style={{ fontSize: '1.2vw', display: 'inline-block' }}>
                    Wallets to receive royalties:
                </label>
                <SmallSpacer />
                <Input.Group style={{ display: 'flex' }} compact>
                    <Form.Item
                        name="firstRoyaltyWallet"
                        style={{
                            margin: '0 1rem 0 0',
                            flexGrow: '100',
                            fontFamily: 'monospace',
                        }}
                        rules={[
                            {
                                required: true,
                                message:
                                    'Please enter wallet to receive royalties',
                            },
                            {
                                pattern: new RegExp(/^0x[a-fA-F0-9]{40}?$/),
                                message: '',
                            },
                        ]}
                    >
                        <Input placeholder="First wallet (required)" />
                    </Form.Item>
                    <Form.Item
                        name="firstRoyaltyPercentage"
                        style={{ margin: '0' }}
                        rules={[
                            {
                                required: true,
                                message: '',
                            },
                        ]}
                    >
                        <InputNumber
                            min={0.01}
                            max={20}
                            formatter={(value) => `${value}%`}
                            style={{ width: '5rem' }}
                        />
                    </Form.Item>
                </Input.Group>
                <MediumSpacer />
                <Input.Group style={{ display: 'flex' }} compact>
                    <Form.Item
                        name="secondRoyaltyWallet"
                        style={{
                            margin: '0 1rem 0 0',
                            flexGrow: '100',
                            fontFamily: 'monospace',
                        }}
                    >
                        <Input placeholder="Second wallet (optional)" />
                    </Form.Item>
                    <Form.Item
                        name="secondRoyaltyPercentage"
                        style={{ margin: '0' }}
                    >
                        <InputNumber
                            min={0}
                            max={20}
                            formatter={(value) => `${value}%`}
                            style={{ width: '5rem' }}
                        />
                    </Form.Item>
                </Input.Group>
            </Form>
            <div
                style={{
                    display: 'flex',
                    padding: '0 3rem',
                    marginTop: '3rem',
                }}
            >
                {/* <Button
                    type="primary"
                    shape="round"
                    className="button-primary"
                    size="large"
                    onClick={() => {
                        setContractFields(undefined)
                        onClose()
                    }}
                >
                    Cancel
                </Button> */}
                <FillSeperator />
                <Button
                    type="primary"
                    shape="round"
                    className="button-primary"
                    size="large"
                    onClick={() => handleSubmit()}
                    loading={loading}
                    style={{
                        ...(error && {
                            backgroundColor: 'red',
                            borderColor: 'red',
                        }),
                    }}
                >
                    {error ? 'Error' : 'Submit'}
                </Button>
            </div>
        </Modal>
    )
}

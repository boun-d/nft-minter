import React, { useMemo, useState } from 'react'
import { Form, Input, Button, InputNumber } from 'antd'
import { ethers } from 'ethers'
import styled from 'styled-components'

import factoryABI from 'contract/factoryABI.json'

import { SmallSpacer } from 'common/styles/common.styles'

const AirdropWrapper = styled.div`
    border: 3px solid #8a959c;
    padding: 2.5rem 3rem;
`

interface Props {
    contractAddress: string | undefined
    collectionSize: number | undefined
}

export const Airdrop: React.FC<Props> = ({
    contractAddress,
    collectionSize,
}) => {
    const ethereum = (window as any).ethereum

    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)
    const [success, setSuccess] = useState<boolean>(false)

    const [form] = Form.useForm()

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await form.validateFields()

            if (!process.env.REACT_APP_FACTORY_CONTRACT_ADDRESS)
                throw new Error('Factory contract address not defined')

            const { nftNumber, walletAddress } = form.getFieldsValue()

            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(
                process.env.REACT_APP_FACTORY_CONTRACT_ADDRESS,
                factoryABI,
                signer
            )

            const transaction = await contract.airdropNft(
                contractAddress,
                walletAddress,
                Number(nftNumber)
            )
            const result = await transaction.wait()

            if (!!result) {
                setSuccess(true)
            } else {
                setError(true)
            }
        } catch (e) {
            console.error(e)
            setError(true)
        } finally {
            setLoading(false)
            setTimeout(() => {
                setSuccess(false)
                setError(false)
            }, 3000)
        }
    }

    const buttonText = useMemo(() => {
        if (loading) return 'Loading'
        if (success) return 'Success!'
        if (error) return 'Error'
        return 'Submit'
    }, [loading, success, error])

    return (
        <AirdropWrapper>
            <h2>Airdrop</h2>
            <SmallSpacer />
            <Form colon={false} form={form} requiredMark={false}>
                <Form.Item
                    label={<span>NFT number</span>}
                    labelAlign="left"
                    name="nftNumber"
                    rules={[
                        {
                            required: true,
                            message: 'Please input NFT number',
                        }
                    ]}
                >
                    <InputNumber min={1} max={collectionSize} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    label={<span>Wallet address</span>}
                    labelAlign="left"
                    name="walletAddress"
                    rules={[
                        {
                            required: true,
                            message: 'Please input receiving wallet address',
                        },
                        {
                            pattern: new RegExp(/^0x[a-fA-F0-9]{40}?$/),
                            message: '',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
            </Form>
            <Button
                shape="round"
                type="primary"
                onClick={handleSubmit}
                size="small"
                loading={loading}
                style={{
                    height: '2rem',
                    float: 'right',
                    ...(success && {
                        backgroundColor: 'green',
                        borderColor: 'green',
                    }),
                    ...(error && {
                        backgroundColor: 'red',
                        borderColor: 'red',
                    }),
                }}
            >
                {buttonText}
            </Button>
        </AirdropWrapper>
    )
}

import React, { useMemo, useState } from 'react'
import { Form, Input, Button } from 'antd'
import styled from 'styled-components'

import axios from 'config/axios'

import { SmallSpacer } from 'common/styles/common.styles'

const AddOwnerWrapper = styled.div`
    border: 3px solid #8a959c;
    padding: 2.5rem 3rem;
`

export const AddOwner: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)
    const [success, setSuccess] = useState<boolean>(false)

    const [form] = Form.useForm()

    const handleSubmit = async () => {
        try {
            setLoading(true)

            await form.validateFields()

            const { walletOwner, publicAddress } = form.getFieldsValue()
            const result = await axios({
                method: 'post',
                url: `${
                    process.env.REACT_APP_SERVER_URL
                }/user`,
                data: {
                    walletOwner,
                    publicAddress,
                    role: 'COLLECTION_OWNER',
                },
            }).then((res) => res.status === 201)

            if (result) {
                setSuccess(true)
            } else {
                setError(true)
            }
        } catch (e) {
            setError(true)
        } finally {
            setTimeout(() => {
                setError(false)
                setSuccess(false)
            }, 2000)
            setLoading(false)
        }
    }

    const buttonText = useMemo(() => {
        if (loading) return 'Loading...'
        if (error) return 'Error please try again...'
        if (success) return 'Success!'
        return 'Submit'
    }, [loading, error, success])

    return (
        <AddOwnerWrapper>
            <h2>Add collection owner</h2>
            <SmallSpacer />
            <Form colon={false} form={form} requiredMark={false}>
                <Form.Item
                    label={<span>Wallet owner name</span>}
                    labelAlign="left"
                    name="walletOwner"
                    rules={[
                        {
                            required: true,
                            message: "Please input the collection owner's name",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label={<span>Wallet address</span>}
                    labelAlign="left"
                    name="publicAddress"
                    rules={[
                        {
                            required: true,
                            message: 'Please input receiving wallet address',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Button
                    shape="round"
                    type="primary"
                    onClick={() => handleSubmit()}
                    size="small"
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
            </Form>
        </AddOwnerWrapper>
    )
}

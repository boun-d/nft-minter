import React, { useMemo, useState } from 'react'
import { Button, Form, Input } from 'antd'
import styled from 'styled-components'

import axios from 'config/axios'
import { MediumSpacer, SmallSpacer } from 'common/styles/common.styles'

const SetWebsiteWrapper = styled.div`
    width: 100%;
    border: 3px solid #8a959c;
    padding: 2.5rem 3rem;

    h2 {
        display: inline-block;
        
    }
`

interface Props {
    collectionId: string
}

export const SetWebsite: React.FC<Props> = ({ collectionId }) => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)
    const [success, setSuccess] = useState<boolean>(false)

    const handleSubmit = async () => {
        const { website } = form.getFieldsValue()
        setLoading(true)
        try {
            await form.validateFields();
            const result = await axios({
                method: 'post',
                url: `${process.env.REACT_APP_SERVER_URL}/collection/${collectionId}/set-website`,
                data: { website },
                headers: { 'Content-Type': 'application/json' },
            })
            if (result.status === 200) {
                setSuccess(true)
            } else {
                setError(true)
            }
        } catch (e) {
            setError(true)
        } finally {
            setLoading(false)
            setTimeout(() => {
                setSuccess(false)
                setError(false)
            }, 2000)
        }
    }

    const buttonText = useMemo(() => {
        if (loading) return 'Loading'
        if (success) return 'Success!'
        if (error) return 'Error'
        return 'Submit'
    }, [loading, success, error])
    
    return (
        <SetWebsiteWrapper>
            <h2>Set minting page website link</h2>
            <SmallSpacer />
            <Form
                colon={false}
                labelAlign="left"
                form={form}
                requiredMark={false}
            >
            <Form.Item
                style={{ margin: '0', display: 'inline-block', width: '80%' }}
                name="website"
                rules={[
                    {
                        required: true,
                        message: 'Please input URL',
                    },
                    {
                        pattern: new RegExp(
                            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/
                        ),
                        message: 'Not a valid URL',
                    }
                ]}
            >
                <Input/>
            </Form.Item>
            <Button
                shape="round"
                type="primary"
                className="layer-button"
                onClick={() => handleSubmit()}
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
            </Form>
        </SetWebsiteWrapper>
    )
}

import React, { useMemo, useState } from 'react'
import { Button } from 'antd'
import styled from 'styled-components'

import axios from 'config/axios'

const SetBackgroundImageWrapper = styled.div`
    width: 100%;
    border: 3px solid #8a959c;
    padding: 2.5rem 3rem;

    h2 {
        display: inline-block;
        margin: 0;
    }
`

interface Props {
    collectionId: string
}

export const SetBackgroundImage: React.FC<Props> = ({ collectionId }) => {
    const [file, setFile] = useState<File>()
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)
    const [success, setSuccess] = useState<boolean>(false)

    const handleSubmit = async () => {
        const formData = new FormData()
        formData.append('backgroundImage', file!)
        setFile(undefined)
        setLoading(true)
        try {
            const result = await axios({
                method: 'post',
                url: `${process.env.REACT_APP_SERVER_URL}/collection/${collectionId}/set-background-image`,
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
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
        return 'Select image'
    }, [loading, success, error])

    return (
        <SetBackgroundImageWrapper>
            <h2>Set minting page background image</h2>
            <input
                type="file"
                id="select-background-image-input"
                accept=".png,.jpg,.jpeg"
                onChange={(e) => {
                    const files = !!e.target.files
                        ? Array.from(e.target.files)
                        : []
                    setFile(files[0])
                }}
                style={{ display: 'none' }}
            />
            {file ? (
                <>
                    <Button
                        shape="round"
                        type="primary"
                        className="layer-button"
                        onClick={() => handleSubmit()}
                        size="small"
                        style={{
                            height: '2rem',
                            float: 'right',
                        }}
                    >
                        Submit
                    </Button>
                    <Button
                        shape="round"
                        type="primary"
                        className="layer-button"
                        onClick={() => setFile(undefined)}
                        size="small"
                        style={{
                            height: '2rem',
                            float: 'right',
                            marginRight: '1rem',
                            backgroundColor: 'red',
                            borderColor: 'red',
                        }}
                    >
                        Remove
                    </Button>
                </>
            ) : (
                <Button
                    shape="round"
                    type="primary"
                    className="layer-button"
                    onClick={() =>
                        document
                            .getElementById(`select-background-image-input`)
                            ?.click()
                    }
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
            )}
        </SetBackgroundImageWrapper>
    )
}

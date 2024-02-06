import React, { useState } from 'react'
import { Form, Input, Button, FormInstance, InputNumber } from 'antd'
import axios from 'config/axios'

import Modal from 'common/components/Modal'
import {
    FillSeperator,
    MediumSpacer,
    SmallSpacer,
} from 'common/styles/common.styles'
import { useParams } from 'react-router-dom'

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

interface Props {
    numbersToRemove: number[]
    setContractFields: (fields: ContractSpec | undefined) => void
    refetchCollectionStatus: () => void
    onClose: () => void
}

export const AddToBlockchainModal: React.FC<Props> = ({
    numbersToRemove,
    setContractFields,
    refetchCollectionStatus,
    onClose,
}) => {
    const { collectionId } = useParams<{ collectionId: string }>()

    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)

    const handleSubmit = async () => {
        try {
            setLoading(true)

            const result = await axios({
                method: 'post',
                url: `${process.env.REACT_APP_SERVER_URL}/collection/${collectionId}/sync-to-ipfs`,
                data: { numbersToRemove },
            }).then((res) => res.status === 200)

            if (!result) throw new Error('Could not sync files to IPFS')

            onClose()
            refetchCollectionStatus()
        } catch (e) {
            console.warn(e)
            setError(true)
        } finally {
            setLoading(false)
            setTimeout(() => setError(false), 3500)
        }
    }

    return (
        <Modal title="Step 1 - Upload collection to IPFS">
            <span>
                On click of 'Upload', the collection will be uploaded to IPFS.
                Once uploaded, you will proceed to step 2 where you will be
                prompted to enter the required details to deploy the contract.
            </span>
            <div
                style={{
                    display: 'flex',
                    padding: '0 3rem',
                    marginTop: '3rem',
                }}
            >
                <Button
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
                </Button>
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
                    {error ? 'Error' : 'Upload'}
                </Button>
            </div>
        </Modal>
    )
}

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Button } from 'antd'

import './index.css'

import { Route, RouteContainer } from 'common/components/RouteContainer'
import {
    LoadingModal,
    ErrorModal,
    ProcessingStatusModal,
    UploadingStatusModal,
} from './components/StatusModals'
import { FillSeperator, LargeSpacer } from 'common/styles/common.styles'
import { fetchCollection, fetchCollectionStatus } from 'common/queries'
import { AddToBlockchainModal } from './components/AddToBlockchainModal'
import { DeployContractModal } from './components/DeployContractModal'

interface Props {
    collectionStatus: 'PROCESSED' | 'DEPLOYED'
    setContractFields?: (fields: ContractSpec | undefined) => void
    refetchCollectionStatus?: () => void
}

export const InnerPreviewArtwork: React.FC<Props> = ({
    collectionStatus,
    setContractFields,
    refetchCollectionStatus,
}) => {
    const { collectionId } = useParams<{ collectionId: string }>()

    const { isLoading, isError, data } = useQuery(
        ['collection', collectionId],
        fetchCollection
    )

    const [
        isShowAddCollectionToBlockchainModal,
        setIsShowAddCollectionToBlockchainModal,
    ] = useState<boolean>(false)
    const [numberOfImagesShowing, setNumberOfImagesShowing] =
        useState<number>(0)
    const [numbersToRemove, setNumbersToRemove] = useState<number[]>([])

    const imageNumbers = useMemo(
        () =>
            Array.from({ length: numberOfImagesShowing })
                .map((_, i) => i + 1)
                .filter((number) => !numbersToRemove.includes(number)),
        [numberOfImagesShowing, numbersToRemove]
    )

    const handleDelete = (number: number) => {
        setNumbersToRemove((d) => [number, ...d])
    }
    const handleUndoDelete = () => {
        setNumbersToRemove((d) => d.slice(1))
    }
    const handleShowMoreImages = () => {
        const numberOfImagesRemaining =
            data!.collectionSize - numberOfImagesShowing
        const increaseBy =
            numberOfImagesRemaining < 100 ? numberOfImagesRemaining : 100
        setNumberOfImagesShowing((number) => number + increaseBy)
    }

    const handleShowJSON = (number: number) => {
        window.open(
            `${process.env.REACT_APP_INFURA_IPFS_PROJECT_URL}/${data?.jsonFilesDirectoryHash}/${number}`
        )
    }

    useEffect(() => {
        if (!isLoading && !isError) {
            const initalLength =
                Number(data?.collectionSize) < 100
                    ? Number(data?.collectionSize)
                    : 100
            setNumberOfImagesShowing(initalLength)
        }
    }, [data])

    if (isLoading) {
        return <LoadingModal />
    }
    if (isError) {
        return <ErrorModal />
    }
    return (
        <>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '4vw 12vw',
                }}
            >
                <div
                    className="action-header"
                    style={{
                        display: 'flex',
                    }}
                >
                    {collectionStatus === 'PROCESSED' && (
                        <>
                            {!!numbersToRemove.length && (
                                <Button
                                    type="primary"
                                    shape="round"
                                    className="button-primary"
                                    size="large"
                                    onClick={() => handleUndoDelete()}
                                >
                                    Undo
                                </Button>
                            )}
                            <FillSeperator />
                            <Button
                                type="primary"
                                shape="round"
                                className="button-primary"
                                size="large"
                                onClick={() =>
                                    setIsShowAddCollectionToBlockchainModal(
                                        true
                                    )
                                }
                            >
                                + Add collection to Blockchain
                            </Button>
                        </>
                    )}
                </div>
                <LargeSpacer />
                <div className="artwork-grid">
                    {imageNumbers.map((number) => (
                        <div key={number}>
                            <div
                                style={{
                                    border: '4px solid rgb(6,26,44)',
                                }}
                            >
                                <div className="image-container">
                                    <img
                                        className="image"
                                        src={
                                            collectionStatus === 'PROCESSED'
                                                ? `${process.env.REACT_APP_SERVER_URL}/${collectionId}/${number}.png`
                                                : `${process.env.REACT_APP_INFURA_IPFS_PROJECT_URL}/${data?.imagesDirectoryHash}/${number}`
                                        }
                                        style={{
                                            width: '12.85vw',
                                            height: '12.85vw',
                                            zIndex: '1',
                                        }}
                                    />
                                    {collectionStatus === 'PROCESSED' &&
                                        numbersToRemove.length + 1 !==
                                            data?.collectionSize && (
                                            <button
                                                className="image-button"
                                                onClick={() =>
                                                    handleDelete(number)
                                                }
                                            >
                                                <div className="image-button-text processed">
                                                    DELETE
                                                </div>
                                            </button>
                                        )}
                                    {collectionStatus === 'DEPLOYED' && (
                                        <button
                                            className="image-button"
                                            onClick={() =>
                                                handleShowJSON(number)
                                            }
                                        >
                                            <div className="image-button-text show-json">
                                                OPEN METADATA
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <span
                                style={{
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    marginLeft: '4px',
                                }}
                            >
                                {`# ${number}`}
                            </span>
                        </div>
                    ))}
                </div>
                {numberOfImagesShowing !== data?.collectionSize && (
                    <>
                        <LargeSpacer />
                        <Button
                            type="primary"
                            id="view-more-images"
                            shape="round"
                            className="button-primary"
                            size="large"
                            onClick={() => handleShowMoreImages()}
                            style={{ display: 'block', margin: '0 auto' }}
                        >
                            + View more images
                        </Button>
                    </>
                )}
            </div>
            {isShowAddCollectionToBlockchainModal && (
                <AddToBlockchainModal
                    numbersToRemove={numbersToRemove}
                    setContractFields={setContractFields!}
                    refetchCollectionStatus={refetchCollectionStatus!}
                    onClose={() =>
                        setIsShowAddCollectionToBlockchainModal(false)
                    }
                />
            )}
        </>
    )
}

export const PreviewArtworkContainer: React.FC = () => {
    const { collectionId } = useParams<{ collectionId: string }>()

    const [refetchInterval, setRefetchInterval] = useState<number | false>(
        false
    )
    const {
        isLoading,
        isError,
        data: status,
        refetch,
    } = useQuery(['collectionStatus', collectionId], fetchCollectionStatus, {
        refetchInterval,
    })

    useEffect(() => {
        if (!isLoading) {
            setRefetchInterval(() =>
                ['PROCESSING', 'UPLOADING'].includes(status) ? 10000 : false
            )
        }
    }, [isLoading, status])

    if (isLoading) {
        return <LoadingModal />
    }
    if (isError) {
        return <ErrorModal />
    }
    if (status === 'CREATED') {
        return <ErrorModal />
    }
    if (status === 'PROCESSING') {
        return <ProcessingStatusModal />
    }
    if (status === 'PROCESSED') {
        return (
            <RouteContainer route={Route.PREVIEW_ARTWORK}>
                {() => (
                    <InnerPreviewArtwork
                        collectionStatus={'PROCESSED'}
                        refetchCollectionStatus={refetch}
                    />
                )}
            </RouteContainer>
        )
    }
    if (status === 'UPLOADING') {
        return <UploadingStatusModal />
    }
    if (status === 'UPLOADED') {
        return <DeployContractModal />
    }
    if (status === 'DEPLOYED') {
        return (
            <RouteContainer route={Route.PREVIEW_ARTWORK}>
                {() => <InnerPreviewArtwork collectionStatus={'DEPLOYED'} />}
            </RouteContainer>
        )
    }
    return <ErrorModal />
}

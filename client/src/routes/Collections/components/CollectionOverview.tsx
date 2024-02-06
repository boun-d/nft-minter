import React, { useContext } from 'react'
import { useQuery } from 'react-query'

import LoadingPage from 'common/components/LoadingPage'
import { fetchCollection } from 'common/queries'
import { LargeSpacer } from 'common/styles/common.styles'
import { Airdrop } from './Airdrop'
import { MintingPageURL } from './MintingPageURL'
import { SetBackgroundImage } from './SetBackgroundImage'
import { UserContext } from 'context'
import ErrorPage, { ErrorPageVariant } from 'common/components/ErrorPage'
import { SetGif } from './SetGif'
import { SetWebsite } from './SetWebsite'
import { PreviewCollection } from './PreviewCollection'
import { ContractAddressBanner } from './ContractAddressBanner'

const errorPageVariant = (collectionId): ErrorPageVariant => ({
    title: 'Cannot fetch collection',
    subtitle: `Oops! Something went wrong while trying to fetch the collection with ID: ${collectionId}`,
})

interface Props {
    collectionId: string
}

export const CollectionOverview: React.FC<Props> = ({ collectionId }) => {
    const { currentUser } = useContext(UserContext)

    const { isLoading, isError, data, refetch } = useQuery(
        ['collection', collectionId],
        fetchCollection
    )

    if (isLoading) {
        return <LoadingPage />
    }
    if (isError) {
        return <ErrorPage variant={errorPageVariant(collectionId)} retry={() => refetch()} />
    }

    return (
        <>
            <ContractAddressBanner contractAddress={data?.contractAddress || ''} />
            <LargeSpacer />
            <PreviewCollection collectionId={collectionId} />
            <LargeSpacer />
            <MintingPageURL {...{ collectionId }} />
            {currentUser?.role === 'COLLECTION_OWNER' && (
                <>
                    <LargeSpacer />
                    <Airdrop contractAddress={data?.contractAddress} collectionSize={data?.collectionSize} />
                </>
            )}
            <LargeSpacer />
            <SetGif {...{ collectionId }} />
            <LargeSpacer />
            <SetBackgroundImage {...{ collectionId }} />
            <LargeSpacer />
            <SetWebsite {...{ collectionId }} />
        </>
    )
}

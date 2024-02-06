import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Button } from 'antd'
import styled from 'styled-components'

import axios from 'config/axios'

import { Route, RouteContainer } from 'common/components/RouteContainer'
import { LargeSpacer, MediumSpacer } from 'common/styles/common.styles'
import { MintingPageURL } from './components'
import LoadingPage from 'common/components/LoadingPage'
import ErrorModal, { ErrorModalVariant } from 'common/components/ErrorModal'
import { fetchDeployedCollections } from 'common/queries'
import { CollectionOverview } from './components/CollectionOverview'
import { UserContext } from 'context'
import { AddOwner } from './components/AddOwner'
import { SignedInAsBanner } from './components/SignedInAsBanner'
import { TransactionCompleteBanner } from './components/TransactionCompleteBanner'

const CollectionsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    padding: 5rem 10rem;

    .left-column button {
        border: 3px solid #061a2c;
        border-radius: 2rem;
        width: 320px;
        padding: 1rem 1.5rem;

        background-color: #e0e2e5;
        font-size: 15px;

        :hover {
            color: white;
            background-color: #8a959c;

            cursor: pointer;
        }
    }

    .left-column button.selected {
        color: white;
        background-color: #061a2c;
        font-weight: bold;
    }

    .left-column ul {
        width: 320px;
        border: 3px solid #061a2c;
        background-color: #e0e2e5;

        height: 450px;
        padding: 0;
        list-style: none;

        overflow-y: scroll;

        li {
            font-size: 15px;
            padding: 1rem 1.5rem;
        }
        li:hover {
            color: white;
            background-color: #8a959c;

            cursor: pointer;
        }
        li.selected {
            color: white;
            background-color: #061a2c;
            font-weight: bold;
        }
        li:nth-child(2n):not(:hover):not(.selected) {
            background-color: #c1c6ca;
        }
    }

    .right-column {
        margin-left: 3rem;
        display: flex;
        flex-direction: column;
        flex-grow: 100;
    }
`

const FillSeperator = styled.div`
    flex-grow: 1;
`

const errorModalVariant: ErrorModalVariant = {
    title: 'Cannot fetch collections',
    body: (
        <span>
            Oops! Something went wrong while trying to fetch the collections.
            Please make sure the backend server is up and running and try again.
        </span>
    ),
}

interface Props {
    collections: { collectionId: string; collectionName: string }[]
}

const InnerCollections: React.FC<Props> = ({ collections }) => {
    const { publicAddress, currentUser } = useContext(UserContext)
    const { state }: { state: any } = useLocation()
    const navigateTo = useNavigate()

    const initSelectedCollectionId = state?.collectionId
        ? state?.collectionId
        : undefined
    const [selectedCollectionId, setSelectedCollectionId] = useState<
        string | undefined
    >(initSelectedCollectionId)

    const [
        isShowTransactionCompleteBanner,
        setIsShowTransactionCompleteBanner,
    ] = useState<boolean>(!!initSelectedCollectionId)
    setTimeout(
        () =>
            isShowTransactionCompleteBanner &&
            setIsShowTransactionCompleteBanner(false),
        20000
    )

    return (
        <CollectionsWrapper>
            <div className="left-column">
                <button
                    className={`nav-button ${
                        selectedCollectionId === undefined ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedCollectionId(undefined)}
                >
                    {selectedCollectionId === undefined ? 'Home' : 'Go home'}
                </button>
                <MediumSpacer />
                {currentUser?.role === 'COLLECTION_OWNER' && (
                    <>
                        <button
                            className="nav-button role-button"
                            onClick={() => navigateTo('/~/create-artwork')}
                        >
                            Create a collection
                        </button>
                        <MediumSpacer />
                    </>
                )}
                <MediumSpacer />
                <h2>{`${
                    currentUser?.role === 'COLLECTION_OWNER' ? 'Your' : 'All'
                } collections`}</h2>
                <ul>
                    {collections?.map?.(({ collectionId, collectionName }) => (
                        <li
                            className={
                                selectedCollectionId === collectionId
                                    ? 'selected'
                                    : ''
                            }
                            onClick={() =>
                                setSelectedCollectionId(collectionId)
                            }
                            key={collectionId}
                        >
                            {collectionName}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="right-column">
                {isShowTransactionCompleteBanner && (
                    <>
                        <TransactionCompleteBanner />
                        <LargeSpacer />
                    </>
                )}
                <SignedInAsBanner />
                <LargeSpacer />
                {selectedCollectionId ? (
                    <CollectionOverview collectionId={selectedCollectionId} />
                ) : (
                    <>{currentUser?.role === 'ADMIN' && <AddOwner />}</>
                )}
            </div>
        </CollectionsWrapper>
    )
}

export const CollectionsContainer: React.FC = () => {
    const { publicAddress, currentUser } = useContext(UserContext)

    const queryParam =
        currentUser?.role === 'COLLECTION_OWNER' ? publicAddress : undefined
    const { isLoading, isError, data } = useQuery(
        ['collections', queryParam],
        fetchDeployedCollections
    )

    return (
        <RouteContainer route={Route.COLLECTIONS}>
            {() => {
                if (isLoading) {
                    return <LoadingPage />
                }
                if (isError || !data) {
                    return <ErrorModal variant={errorModalVariant} />
                }
                return <InnerCollections collections={data} />
            }}
        </RouteContainer>
    )
}

import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'

import factoryABI from 'contract/factoryABI.json'
import metamaskFox from 'common/images/metamask-fox.png'
import greenTick from 'common/images/green-tick.png'

import link from 'common/images/link.svg'

import placeholderGif from 'common/images/minting-page-placeholder.gif'

import { MediumSpacer } from 'common/styles/common.styles'
import { MintingPageWrapper, ErrorTextWrapper } from './page.styles'
import { LoadingSpinner } from 'common/components/LoadingSpinner'
import { fetchDeployedCollection } from 'common/queries'
import { ethers } from 'ethers'

interface InnerMintingPageProps {
    data: any
}

export const InnerMintingPage: React.FC<InnerMintingPageProps> = ({ data }) => {
    const ethereum = (window as any).ethereum

    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<boolean>(false)
    const [success, setSuccess] = useState<boolean>(false)

    const [remainingNfts, setRemainingNfts] = useState<number>(0)
    const [cost, setCost] = useState<ethers.BigNumber>()

    const {
        collectionName,
        collectionSize,
        gifDirectoryHash,
        website,
        contractAddress,
    } = data

    const handleMint = async () => {
        if (!process.env.REACT_APP_FACTORY_CONTRACT_ADDRESS) return

        setLoading(true)

        try {
            const provider = new ethers.providers.Web3Provider(ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(
                process.env.REACT_APP_FACTORY_CONTRACT_ADDRESS,
                factoryABI,
                signer
            )
            const transaction = await contract.mintNft(contractAddress)
            await transaction.wait()
            
            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
            }, 10000)

            const newRemainingNfts = await getRemainingNfts();
            setRemainingNfts(newRemainingNfts);
        } catch (e) {
            setError(true)
            setTimeout(() => {
                setError(false)
            }, 3000)
        } finally {
            setLoading(false)
        }
    }

    const getRemainingNfts = async (): Promise<number> => {
        if (!process.env.REACT_APP_FACTORY_CONTRACT_ADDRESS) return 0

        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
            process.env.REACT_APP_FACTORY_CONTRACT_ADDRESS,
            factoryABI,
            signer
        )

        const number = await contract.getNftRemaingNfts(contractAddress)
        return number;
    }

    const buttonText = useMemo(() => {
        if (error) return 'Something went wrong...'
        if (success) return 'Minted successfully!'
        if (loading) return 'Loading...'
        return ''
    }, [loading, error, success])

    useEffect(() => {
        getRemainingNfts().then((res) => {
            setRemainingNfts(res)
            setLoading(false)
        })
    }, [])

    return (
        <div className="container">
            <div className="title">
                <b>{collectionName}</b>
            </div>
            <MediumSpacer />
            <div className="gif">
                <img
                    src={
                        gifDirectoryHash
                            ? `${process.env.REACT_APP_IPFS_GATEWAY_URL}/${gifDirectoryHash}`
                            : placeholderGif
                    }
                />
            </div>
            <MediumSpacer />
            <div className="nft-footer">
                <div className="nft-counter">
                    <p>
                        <strong>{`${remainingNfts} NFTs`}</strong>
                        <br />
                        <span>{` of ${collectionSize} remaining`}</span>
                    </p>
                </div>
                {!!website && (
                    <button
                        className="nft-external-link"
                        onClick={() => window.open(website)}
                    >
                        <img src={link} />
                    </button>
                )}
            </div>
            <MediumSpacer />
            {remainingNfts !== 0 && (
                <div>
                    <button
                        className="mint-button"
                        disabled={loading || success || error}
                        onClick={() => handleMint()}
                        style={{
                            ...(success && { backgroundColor: '#64AA4F' }),
                            ...(error && { backgroundColor: 'red' }),
                        }}
                    >
                        {loading || success || error ? (
                            <span style={{ color: 'white' }}>{buttonText}</span>
                        ) : (
                            <>
                                <img src={metamaskFox} />
                                <span>
                                    Mint random
                                </span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}

export const MintingPageContainer: React.FC = () => {
    const { collectionId } = useParams<{ collectionId: string }>()

    const { isLoading, isError, data } = useQuery(
        ['collection', collectionId],
        fetchDeployedCollection
    )

    useEffect(() => {
        if (isLoading) {
            document.title = 'Loading'
        } else if (isError) {
            document.title = 'Collection not found'
        } else {
            document.title = data.collectionName
            if (!!data.backgroundImageDirectoryHash) {
                const imageUrl = `url(${process.env.REACT_APP_IPFS_GATEWAY_URL}/${data.backgroundImageDirectoryHash})`
                document.body.style.backgroundImage = imageUrl
                document.body.style.backgroundPosition = 'center'
                document.body.style.backgroundSize = 'cover'
                document.body.style.backgroundRepeat = 'no-repeat'
            }
        }
    }, [isLoading, isError, data])

    return (
        <MintingPageWrapper>
            <>
                {(() => {
                    if (isLoading) {
                        return <LoadingSpinner size="sm" />
                    }
                    if (isError) {
                        return (
                            <ErrorTextWrapper>
                                <b>Collection not found.</b>
                            </ErrorTextWrapper>
                        )
                    }
                    return <InnerMintingPage {...{ data }} />
                })()}
            </>
        </MintingPageWrapper>
    )
}

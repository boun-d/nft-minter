import React, { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import path from 'path'

import './App.css'

import { UserContext } from './context'

import PrivateRoute from './common/components/PrivateRoute'
import LoadingPage from 'common/components/LoadingPage'
import checkAuth, { decodeToken, requestPublicAddress } from './config/auth'
import {
    Login,
    CreateArtwork,
    PreviewArtwork,
    Collections,
    MintingPage,
} from './routes'
import { User } from 'context/UserContext'

function App() {
    const [loading, setLoading] = useState<boolean>(true)
    const [publicAddress, setPublicAddress] = useState<string | undefined>()
    const [currentUser, setCurrentUser] = useState<User>();

    const ethereum = (window as any).ethereum
    ethereum?.on('accountsChanged', (accounts) =>
        setPublicAddress(() => accounts[0] || '')
    )

    const setUser = (publicAddress: string) => {
        const { authenticated } = checkAuth(publicAddress);
        if (!authenticated) return;

        const token = localStorage.getItem('token')
        const decoded = decodeToken(token || '')
        if (!decoded) {
            return;
        }
        setCurrentUser(decoded.user);
    }

    useEffect(() => {
        requestPublicAddress()
            .then((address) => {
                setUser(address);
                setPublicAddress(() => address || '')
            })
            .finally(() => setLoading(() => false))
    }, [])

    const client = new QueryClient()

    if (loading) {
        return <LoadingPage />
    }

    return (
        <QueryClientProvider {...{ client }}>
            <UserContext.Provider value={{ publicAddress, currentUser, setCurrentUser }}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route
                            path="/~/create-artwork"
                            element={
                                <PrivateRoute element={CreateArtwork} roles={['COLLECTION_OWNER']} />
                            }
                        />
                        <Route
                            path="/~/preview-artwork/:collectionId"
                            element={
                                <PrivateRoute element={PreviewArtwork} roles={['COLLECTION_OWNER']}/>
                            }
                        />
                        <Route
                            path="/~/collections"
                            element={<PrivateRoute element={Collections} roles={['ADMIN', 'COLLECTION_OWNER']}/>}
                        />
                        <Route
                            path="/collection/:collectionId"
                            element={<MintingPage />}
                        />
                    </Routes>
                </BrowserRouter>
            </UserContext.Provider>
        </QueryClientProvider>
    )
}

export default App

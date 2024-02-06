import React from 'react'

export type Role = 'ADMIN' | 'COLLECTION_OWNER';

export type User = {
    walletOwner: string;
    publicAddress: string;
    role: Role
}

const UserContext = React.createContext<{
    publicAddress: string | undefined;
    currentUser?: User;
    setCurrentUser: (user: User) => void
}>({ publicAddress: '', currentUser: undefined, setCurrentUser: (user: User) => {} })

export { UserContext }

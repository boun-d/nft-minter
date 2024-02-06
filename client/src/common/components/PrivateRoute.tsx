import { useContext } from 'react'
import { Navigate } from 'react-router-dom'

import { Role, UserContext } from '../../context/UserContext'
import checkAuth, { decodeToken } from 'config/auth'

interface Props {
    element: any
    roles: Role[]
}

const PrivateRoute = ({ element: Component, roles }: Props) => {
    const { publicAddress } = useContext(UserContext)
    const { authenticated } = checkAuth(publicAddress)

    const token = localStorage.getItem('token')
    const decoded = decodeToken(token || '')

    if (!authenticated || !decoded) {
        return <Navigate replace to="/" />
    }
    if (!roles.includes(decoded.user.role)) {
        return <Navigate replace to="/~/collections" />
    }
    return <Component />
}

export default PrivateRoute

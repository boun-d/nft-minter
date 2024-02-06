import React, { useContext, useEffect } from 'react'
import styled from 'styled-components'
import { Button } from 'antd'

import logo from 'common/images/logo.png'
import { useNavigate } from 'react-router-dom'
import { UserContext } from 'context'

const HeaderStyle = styled.header`
    width: 100%;
    height: 100px;
    z-index: 999;

    marginbottom: 100px;

    display: flex;
    justify-content: space-between;

    background-color: rgb(6, 26, 44);

    position: fixed;

    .logo {
        display: flex;
        max-width: 200px;
        margin: auto 3rem;
        padding: 1.5rem 0;
        height: 100%;
    }
    .heading {
        width: 100%;
        margin: auto;
        font-size: 2rem;
        color: white;
        text-align: center;
        align-self: center;
        position: absolute;
    }
    .navigation {
        align-self: end;
        margin: auto 3rem;
    }
`

const FooterStyle = styled.footer`
    height: 50px;
    width: 100%;
`

export enum Route {
    CREATE_ARTWORK = 'Create artwork',
    PREVIEW_ARTWORK = 'Preview artwork',
    COLLECTIONS = 'Collections',
    ADD_OWNER = 'Add owner',
}

interface Props {
    route: Route
    children: any
}
export const RouteContainer: React.FC<Props> = ({ route, children }) => {
    const navigateTo = useNavigate()

    useEffect(() => {
        document.title = route
    }, [])

    return (
        <>
            <HeaderStyle>
                <div className="logo">
                    <img src={logo} />
                </div>
                <div className="heading">
                    <strong>NFT ART GENERATOR & MINTER</strong>
                </div>
                {route !== Route.COLLECTIONS && (
                    <div className="navigation">
                        <Button
                            shape="round"
                            type="primary"
                            onClick={() => navigateTo('/~/collections')}
                            className="grey-button"
                            size="large"
                        >
                            Go to collections
                        </Button>
                    </div>
                )}
            </HeaderStyle>
            <div
                className="header-buffer"
                style={{ height: '100px', backgroundColor: 'white' }}
            />
            <div style={{ backgroundColor: 'white' }}>
                {children()}
            </div>
            <FooterStyle />
        </>
    )
}

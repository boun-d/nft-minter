// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

configure({ adapter: new Adapter() });


const urlMock = (function () {

    return {
        createObjectURL: function (obj: Blob | MediaSource) {
            return ''
        },
    }
})()

const localStorageMock = (function () {
    let store = {}

    return {
        getItem: function (key) {
            return store[key] || null
        },
        setItem: function (key, value) {
            store[key] = value.toString()
        },
        removeItem: function (key) {
            delete store[key]
        },
        clear: function () {
            store = {}
        },
    }
})()

const precessEnvMock = (function () {
    return {
        env: {
            REACT_APP_DNS: 'https://some-dns-site.com',
            REACT_APP_SERVER_URL: 'http://localhost:8080',
            REACT_APP_CLIENT_URL: 'https://some-site.com',
            REACT_APP_INFURA_IPFS_PROJECT_URL: 'https://nft-minter.infura-ipfs.io/ipfs',
        }
    }
})()

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
})
Object.defineProperty(window, 'URL', {
    value: urlMock,
})
Object.defineProperty(window, 'process', {
    value: precessEnvMock,
})

global.matchMedia = global.matchMedia || function () {
    return {
        addListener: jest.fn(),
        removeListener: jest.fn(),
    };
};
import { shallow } from 'enzyme'

import { Button, Form } from 'antd'
import { AddOwner } from './AddOwner'

const mockAxios = jest.fn()
jest.mock('config/axios.ts', () => () => mockAxios())

function tick(time: number = 0) {
    return new Promise((resolve) => {
        setTimeout(resolve, time)
    })
}

describe('AddOwner', () => {
    const formSpy = jest.spyOn(Form, 'useForm')

    beforeEach(() => {
        mockAxios.mockReturnValue(Promise.resolve({ status: 201 }))

        formSpy.mockImplementation(() => [
            {
                validateFields: () => Promise.resolve(),
                getFieldsValue: () => ({
                    walletOwner: 'walletOwner',
                    publicAddress: 'publicAddress'
                })
            } as any
        ])
    })
    afterEach(() => {
        mockAxios.mockRestore()
        formSpy.mockReset()
    })

    it('should render Submit button text on init', async () => {
        const wrapper = shallow(<AddOwner />)

        expect(wrapper.find(Button).text()).toBe('Submit')
    })
    it('should render Loading button text if submiting', async () => {
        mockAxios.mockReturnValue((
            new Promise(resolve => {
                setTimeout(() => {
                    resolve({ status: 201 })
                }, 1000)
            })
        ))

        const wrapper = shallow(<AddOwner />)

        expect(wrapper.find(Button).simulate('click'))
        await tick()
        expect(wrapper.find(Button).text()).toBe('Loading...')
    })
    it('should render Error button text if request status is not 201', async () => {
        const StatusIsNot201 = 404
        mockAxios.mockReturnValue(Promise.resolve({ status: StatusIsNot201 }))

        const wrapper = shallow(<AddOwner />)

        expect(wrapper.find(Button).simulate('click'))
        await tick(200)
        expect(wrapper.find(Button).text()).toBe('Error please try again...')
    })
    it('should render Success button text if request status is 201', async () => {
        const wrapper = shallow(<AddOwner />)

        expect(wrapper.find(Button).simulate('click'))
        await tick(200)
        expect(wrapper.find(Button).text()).toBe('Success!')
    })
    it('should render Submit button text after request in 2s', async () => {
        const wrapper = shallow(<AddOwner />)

        expect(wrapper.find(Button).simulate('click'))
        await tick(3000)
        expect(wrapper.find(Button).text()).toBe('Submit')
    })
})
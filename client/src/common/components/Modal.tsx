import React from 'react'
import { Modal as AntdModal } from 'antd'

interface ModalProps {
    title: string
    children: any
}

const Modal: React.FC<ModalProps> = ({ title, children }) => (
    <AntdModal
        open
        centered
        width={'50vw'}
        modalRender={() => (
            <div
                style={{
                    textAlign: 'center',
                    backgroundColor: 'white',
                    padding: '60px',
                    borderRadius: '1rem',
                    pointerEvents: 'auto'
                }}
            >
                <div
                    style={{
                        borderBottom: '4px solid #7f878c',
                        fontSize: '35px',
                        fontWeight: 'bold',
                        padding: '0 30px 30px 30px',
                        marginBottom: '30px'
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        lineHeight: '40px',
                        fontSize: '25px',
                        fontWeight: '500',
                        color: '#7f878c',
                    }}
                >
                    {children}
                </div>
            </div>
        )}
    />
)

export default Modal

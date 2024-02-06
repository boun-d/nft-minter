import { LoadingSpinner } from 'common/components/LoadingSpinner'
import Modal from 'common/components/Modal'

export const LoadingModal = () => (
    <Modal title="Verifying collection status">
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '3rem',
            }}
        >
            <LoadingSpinner size="md" />
        </div>
    </Modal>
)

export const ErrorModal = () => (
    <Modal title="Something went wrong">
        <span>Something went wrong when trying to process your artwork.</span>
    </Modal>
)

export const ProcessingStatusModal = () => (
    <Modal title="Processing collection">
        <span>
            Please wait while your artwork is being processed. This may take
            several minutes.
        </span>
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '3rem',
            }}
        >
            <LoadingSpinner size="md" />
        </div>
    </Modal>
)

export const UploadingStatusModal = () => (
    <Modal title="Uploading collection">
        <span>
            The images are being uploaded to IPFS. Once complete, you will then
            be prompted to deploy the smart contract.
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '3rem',
                }}
            >
                <LoadingSpinner size="md" />
            </div>
        </span>
    </Modal>
)

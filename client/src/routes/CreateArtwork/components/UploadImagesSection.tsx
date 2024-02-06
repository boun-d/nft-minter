import React from 'react'
import { Button } from 'antd'

interface Props {
    images: UploadedImage[]
    handleAddImages: (files: File[]) => void
    handleDeleteAllImages: () => void
}

const UploadImagesSection: React.FC<Props> = ({
    images,
    handleAddImages,
    handleDeleteAllImages,
}) => {
    return (
        <div>
            {!!images.length && (
                <div
                    style={{
                        
                    }}
                >
                    <div className='upload-image-counter'>
                        {`${images.length} image${
                            images.length === 1 ? '' : 's'
                        } selected`}
                    </div>
                </div>
            )}
            <div style={{ textAlign: 'right' }}>
                <input
                    type="file"
                    id="option-image-input"
                    multiple
                    accept=".png"
                    onChange={(e) => {
                        const files = !!e.target.files
                            ? Array.from(e.target.files)
                            : []
                        handleAddImages(files)
                    }}
                    style={{ display: 'none' }}
                />
                {!!images.length && (
                    <Button
                        shape="round"
                        type="primary"
                        className="images-remove-all"
                        style={{
                            backgroundColor: 'red',
                            borderColor: 'red',
                            marginRight: '1rem',
                        }}
                        onClick={() => handleDeleteAllImages()}
                    >
                        Remove all
                    </Button>
                )}

                <Button
                    shape="round"
                    type="primary"
                    className="section-add-images"
                    onClick={() =>
                        document.getElementById('option-image-input')?.click()
                    }
                >
                    + Add image/s
                </Button>
            </div>
        </div>
    )
}

export default UploadImagesSection

import { removeAndRenameFiles } from './removeAndRenameFiles';
import { syncFilesWithIPFS } from './syncFilesWithIPFS';

const { workerData, parentPort } = require('worker_threads');

export async function mainUploader(
  collectionId: string,
  collectionSize: number,
  collectionName: string,
  numbersToRemove: number[],
  ipfsGatewaySecret: string
) {
  const numberOfImagesBeingRemoved = (numbersToRemove || []).length;

  const result = await removeAndRenameFiles(
    collectionId,
    collectionSize,
    numbersToRemove,
  );
  if (!result) return;

  const hashes = await syncFilesWithIPFS(
    collectionId,
    collectionSize - numberOfImagesBeingRemoved,
    collectionName,
    ipfsGatewaySecret
  );

  parentPort.postMessage(hashes);
  return;
}

mainUploader(
  workerData.collectionId,
  workerData.collectionSize,
  workerData.collectionName,
  workerData.numbersToRemove,
  workerData.ipfsGatewaySecret
);

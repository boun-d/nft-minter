import * as fs from 'fs';
import * as path from 'path';
import { updateJSONFile } from './updateJSONFile';

export const syncFilesWithIPFS = async (
  collectionId,
  collectionSize,
  collectionName,
  ipfsProjectSecret,
) => {
  const filesDirectory = path.join(
    __dirname,
    '../../../..',
    'public',
    collectionId,
  );

  if (!fs.existsSync(filesDirectory)) return false;
  if (!fs.readdirSync(filesDirectory).length) return false;

  const pinataSDK = require('@pinata/sdk');
  const pinata = new pinataSDK({ pinataJWTKey: ipfsProjectSecret });

  const imageUploadResult = await pinata
    .pinFromFS(filesDirectory + '/images', {
      pinataMetadata: {
        name: collectionId + '_images',
      },
      pinataOptions: {
        cidVersion: 0,
      },
    })
    .catch(() => null);

  const imagesDirectoryHash = imageUploadResult?.IpfsHash;
  if (!imagesDirectoryHash) return false;

  for (let i = 1; i <= collectionSize; i++) {
    const result = updateJSONFile(
      i,
      collectionId,
      collectionName,
      imagesDirectoryHash,
    );
    if (!result) return false;
  }

  const jsonFilesUploadResult = await pinata
    .pinFromFS(filesDirectory + '/jsons', {
      pinataMetadata: {
        name: collectionId + '_jsons',
      },
      pinataOptions: {
        cidVersion: 0,
      },
    })
    .catch(() => null);

  const jsonFilesDirectoryHash = jsonFilesUploadResult?.IpfsHash;
  if (!jsonFilesDirectoryHash) return false;

  return {
    imagesDirectoryHash,
    jsonFilesDirectoryHash,
  };
};

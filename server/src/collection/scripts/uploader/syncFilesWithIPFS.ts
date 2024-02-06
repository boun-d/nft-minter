import * as fs from 'fs';
import * as path from 'path';
import { updateJSONFile } from './updateJSONFile';

const FormData = require('form-data');
const axios = require('axios');

const getHashFromResponseData = (data) => {
  const result = data?.substring(
    data?.lastIndexOf('{'),
    data?.lastIndexOf('}') + 1,
  );
  return JSON.parse(result)?.Hash;
};

export const syncFilesWithIPFS = async (
  collectionId,
  collectionSize,
  collectionName,
  ipfsProjectId,
  ipfsProjectSecret
) => {
  const filesDirectory = path.join(
    __dirname,
    '../../../..',
    'public',
    collectionId,
  );

  if (!fs.existsSync(filesDirectory)) return false;
  if (!fs.readdirSync(filesDirectory).length) return false;

  const projectId = ipfsProjectId;
  const projectSecret = ipfsProjectSecret;
  const auth =
    'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

  const imagesFormData = new FormData();
  for (let i = 1; i <= collectionSize; i++) {
    imagesFormData.append(
      'file',
      fs.createReadStream(path.join(filesDirectory, `${i}.png`)),
      { filename: `${i}`, contentType: 'image/png' },
    );
  }
  const imageUploadResult = await axios.post(
    'https://ipfs.infura.io:5001/api/v0/add',
    imagesFormData,
    {
      params: {
        'wrap-with-directory': true,
        'cid-version': 1,
        has: 'sha2-256',
      },
      maxBodyLength: Infinity,
      headers: {
        ...imagesFormData.getHeaders(),
        Authorization: auth,
      },
    },
  );

  if (!imageUploadResult.data) return false;
  const imagesDirectoryHash = getHashFromResponseData(imageUploadResult.data);

  const jsonFilesFormData = new FormData();
  for (let i = 1; i <= collectionSize; i++) {
    const result = updateJSONFile(
      i,
      collectionId,
      collectionName,
      imagesDirectoryHash,
    );
    if (!result) return false;

    jsonFilesFormData.append(
      'file',
      fs.createReadStream(path.join(filesDirectory, `${i}.json`)),
      { filename: `${i}`, contentType: 'application/json' },
    );
  }

  const config = {
    params: {
      'wrap-with-directory': true,
      'cid-version': 1,
      has: 'sha2-256',
    },
    maxBodyLength: Infinity,
    headers: {
      ...jsonFilesFormData.getHeaders(),
      Authorization: auth,
    },
  };
  const jsonFilesUploadResult = await axios.post(
    'https://ipfs.infura.io:5001/api/v0/add',
    jsonFilesFormData,
    config,
  );

  if (!jsonFilesUploadResult.data) return false;
  const jsonFilesDirectoryHash = getHashFromResponseData(
    jsonFilesUploadResult.data,
  );

  return {
    imagesDirectoryHash,
    jsonFilesDirectoryHash,
  };
};

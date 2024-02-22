import mainGenerator, { readParts, structCleaner } from './mainGenerator';
import { cleanMetada, dirGen } from './detailsCollector';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { NFTS_DIR_NAME } from 'src/collection/constants';

const { workerData } = require('worker_threads');

async function generateCollection(collectionSize) {
  const nftImagesDirectory = join(__dirname, '../..', NFTS_DIR_NAME, 'images');
  const nftJsonsDirectory = join(__dirname, '../..', NFTS_DIR_NAME, 'jsons');

  if (!existsSync(nftImagesDirectory)) mkdirSync(nftImagesDirectory, { recursive: true });
  if (!existsSync(nftJsonsDirectory)) mkdirSync(nftJsonsDirectory, { recursive: true });

  readParts();
  await mainGenerator(collectionSize);
  await dirGen();
  structCleaner();
  cleanMetada();

  return;
}

generateCollection(
  workerData.collectionSize,
);

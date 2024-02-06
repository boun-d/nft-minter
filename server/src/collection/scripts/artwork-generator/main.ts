import mainGenerator, { readParts, structCleaner } from './mainGenerator';
import { cleanMetada, dirGen } from './detailsCollector';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { NFTS_DIR_NAME } from 'src/collection/constants';

const { workerData } = require('worker_threads');

async function generateCollection(collectionSize) {
  const nftsDir = join(__dirname, '../..', NFTS_DIR_NAME);
  if (!existsSync(nftsDir)) {
    mkdirSync(nftsDir, { recursive: true });
  }

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

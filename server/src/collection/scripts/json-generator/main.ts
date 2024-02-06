import * as fs from 'fs';
import * as path from 'path';
import {
  NFTS_DIR_NAME,
  UPLOADED_IMAGES_DIR_NAME,
} from 'src/collection/constants';

const { workerData } = require('worker_threads');

const generateJsonForImages = async (startingNumber: number) => {
  const nftsDir = path.join(__dirname, '../..', NFTS_DIR_NAME);
  if (!fs.existsSync(nftsDir)) {
    fs.mkdirSync(nftsDir, { recursive: true });
  }

  const imagesDir = path.join(__dirname, '../..', UPLOADED_IMAGES_DIR_NAME);
  if (!fs.existsSync(imagesDir)) return false;
  if (!fs.readdirSync(imagesDir).length) return false;

  let currNumber = startingNumber;
  fs.readdirSync(imagesDir, { withFileTypes: true })
    .filter((item) => !item.isDirectory())
    .forEach((file) => {
      fs.copyFileSync(
        path.join(imagesDir, file.name),
        path.join(nftsDir, `${currNumber}.png`),
      );

      const name = file.name.replace('.png', '').replace(/-/g, ' ');
      fs.writeFileSync(
        path.join(nftsDir, `${currNumber}.json`),
        JSON.stringify(
          {
            _edition: currNumber,
            image: '',
            name,
          },
          null,
          2,
        ),
      );
      currNumber++;
    });
};

generateJsonForImages(workerData.startingNumber);

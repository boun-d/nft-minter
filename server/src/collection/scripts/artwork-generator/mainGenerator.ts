import readLayer from './readLayer';
import attGenerator, { detailsCreator } from './detailsCollector';
import * as fs from 'fs';
import * as path from 'path';
import { NFTS_DIR_NAME, UPLOADED_LAYERS_DIR_NAME } from 'src/collection/constants';
import rarityRandomiser from './rarityRandomiser';

const { createCanvas, loadImage } = require('canvas');

const struct: { name: string; number: number }[] = [];
let filesReading = false;
const canvas = createCanvas(1400, 1400);
const ctx = canvas.getContext('2d');
export const readParts = () => {
  fs.readdirSync(path.join(__dirname, '../..', UPLOADED_LAYERS_DIR_NAME)).forEach(files => {
    let layersNum = fs.readdirSync(`${path.join(__dirname, '../..', UPLOADED_LAYERS_DIR_NAME)}/${files}`).length;
    struct.push({ name: files, number: layersNum });
    struct.sort();
    filesReading = true;
  });

};
export const structCleaner = () => {
  struct.length = 0;
};
const mainGenerator = async (version) => {
  const lStruct = readLayer(struct);
  for (let i = 1; i <= version; i++) {
    for (const nftL of lStruct) {
      let rarityPick = rarityRandomiser(nftL.elements);
      let tempNf = nftL.elements[rarityPick];
      if (tempNf) {
        attGenerator(tempNf, nftL);
        const pic = await loadImage(`${nftL.location}${tempNf.fileName}`);
        ctx.drawImage(
          pic,
          nftL.position.x,
          nftL.position.y,
          nftL.size.width,
          nftL.size.height,
        );
        fs.writeFileSync(path.join(__dirname, '../..', NFTS_DIR_NAME, `images/${i}`), canvas.toBuffer('image/png'));
      }
    }
    detailsCreator(i);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};

export default mainGenerator;
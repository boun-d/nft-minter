import {BadRequestException, UnsupportedMediaTypeException} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { allowedImageTypes, UPLOADED_LAYERS_DIR_NAME } from '../constants';
import rareMap from '../scripts/artwork-generator/constants';

export const fileTypeResolver = (req, file, callback) => {
  const extension = path.extname(file.originalname);
  if (!allowedImageTypes.includes(extension)) {
    return callback(new UnsupportedMediaTypeException('Incorrect file type. Must be .png'), false);
  }
  return callback(null, true);
}

export const createArtworkDestinationResolver = (req, file, callback) => {
  const sections = file.originalname.split('_');
  if (sections.length !== 4) {
    return callback(new BadRequestException('Invalid filename encoding.'), null);
  }
  const folderName = [sections[0], sections[1]].join('_');
  const dir = path.join(__dirname, '..', UPLOADED_LAYERS_DIR_NAME, folderName);
  fs.mkdirSync(dir, { recursive: true });
  return callback(null, dir);
};

export const createArtworkFilenameResolver = (req, file, callback) => {
  const sections = file.originalname.split('_');
  if (sections.length !== 4) {
    return callback(new BadRequestException('Invalid filename encoding.'), null);
  }
  const rarityEncodings = rareMap.map(({ key }) => key.replace(/\_/g, ''));
  if (!rarityEncodings.includes(sections[3].replace('.png', ''))) {
    return callback(new BadRequestException('Invalid rarity encoding.'), null);
  }
  const fileName = [sections[2], sections[3]].join('_');
  callback(null, fileName);
};

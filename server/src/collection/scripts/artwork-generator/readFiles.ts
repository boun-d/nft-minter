import * as fs from 'fs';
import restructureFile from './restructureFile';
import checkRare from './checkRare';

const readFiles = point => {
  return fs
    .readdirSync(point)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      return {
        id: index + 1,
        name: restructureFile(i),
        fileName: i,
        rarity: checkRare(i),
      };
    });
};
export default readFiles;
import * as fs from 'fs';
import * as path from 'path';
import { NFTS_DIR_NAME } from 'src/collection/constants';

let metadata = [];
let att = [];
let hash = [];
let decodedHash = [];

export const cleanMetada = () => {
  metadata = [];
};
export const dirGen = async () => {
  const data = metadata.map(({ hash, decodedHash, ...keepAttrs }) => keepAttrs);
  for (let i = 0; i < data.length; i++) {
    let att = [];
    let edition = data[i]._edition;
    data[i].attributes.forEach((temp) => {
      temp.trait = temp.trait.split('_').pop();
      temp.trait = temp.trait[0].toUpperCase() + temp.trait.slice(1);
      temp.value = (temp.value[0].toUpperCase() + temp.value.slice(1)).replace(
        /-/g,
        ' ',
      );
      att.push(temp);
    });
    data[i].attributes = att;
    const dir = path.join(__dirname, '../..', NFTS_DIR_NAME, 'jsons');
    fs.stat(`${dir}/${i + 1}`, (err) => {
      if (err == null || err.code === 'ENOENT') {
        fs.writeFileSync(
          `${dir}/${edition}`,
          JSON.stringify(data[i], null, 2),
        );
      }
    });
  }
};

export const detailsCreator = (_edition) => {
  let temp = {
    _edition,
    hash: hash.join(''),
    decodedHash: decodedHash,
    image: '',
    name: '',
    attributes: att,
  };
  metadata.push(temp);
  att = [];
  hash = [];
  decodedHash = [];
};

const attGenerator = (_temp, _layer) => {
  let tempAttr = {
    value: _temp.name,
    trait: _layer.name,
    rarity: _temp.rarity,
  };
  att.push(tempAttr);
  hash.push(_layer.id);
  hash.push(_temp.id);
  decodedHash.push({ [_layer.id]: _temp.id });
};

export default attGenerator;

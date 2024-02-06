import rareMap from './constants';

const restructureFile = _str => {
  let temp = _str.slice(0, -4);
  rareMap.forEach((r) => {
    temp = temp.replace(r.key, '');
  });
  return temp;
};

export default restructureFile;
import rareMap from './constants';

const checkRare = _str => {
  let rare;

  rareMap.forEach((r) => {
    if (_str.includes(r.key)) {
      rare = r.val;
    }
  });

  return rare;
};

export default checkRare;
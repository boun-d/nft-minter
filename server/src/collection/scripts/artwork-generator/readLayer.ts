import * as path from 'path';
import { UPLOADED_LAYERS_DIR_NAME } from 'src/collection/constants';
import readFiles from './readFiles';

const dir = path.join(__dirname, '../..', UPLOADED_LAYERS_DIR_NAME)
const readLayer = layersOrder => {
  return layersOrder.map((layerObj, index) => ({
    id: index,
    name: layerObj.name,
    location: `${dir}/${layerObj.name}/`,
    elements: readFiles(`${dir}/${layerObj.name}/`),
    position: { x: 0, y: 0 },
    size: { width: 1400, height: 1400 },
    number: layerObj.number,
  }));
};

export default readLayer;
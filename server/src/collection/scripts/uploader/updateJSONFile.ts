import * as fs from 'fs';
import * as path from 'path';

export async function updateJSONFile(
  i: number,
  collectionId: string,
  collectionName: string,
  imageLocationHash: string,
): Promise<boolean> {
  const jsonFile = path.join(
    __dirname,
    '../../../..',
    'public',
    collectionId,
    `${i}.json`,
  );
  if (!fs.existsSync(jsonFile)) return false;

  const jsonString = fs.readFileSync(jsonFile, 'utf8');
  const jsonData = JSON.parse(jsonString);

  jsonData['_edition'] = i;
  jsonData['image'] = `ipfs://${imageLocationHash}/${i}`;

  if (jsonData['attributes']?.length) {
    jsonData['name'] = `${collectionName} #${i}`;
  }

  fs.writeFileSync(jsonFile, JSON.stringify(jsonData, null, 2));
}

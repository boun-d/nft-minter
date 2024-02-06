import * as fs from 'fs';
import * as path from 'path';

export async function removeAndRenameFiles(
  collectionId: string,
  collectionSize: number,
  numbersToRemove: number[],
): Promise<boolean> {
  const filesDirectory = path.join(
    __dirname,
    '../../../..',
    'public',
    collectionId,
  );

  if (!fs.existsSync(filesDirectory)) return false;
  if (!fs.readdirSync(filesDirectory).length) return false;

  const isValidNumbersToRemoveInput =
    Array.isArray(numbersToRemove) &&
    numbersToRemove.every((n) => typeof n === 'number');
  if (!isValidNumbersToRemoveInput) return false;

  let nftNumber = 1;
  for (let i = 1; i <= collectionSize; i++) {
    const currFile = path.join(filesDirectory, `${i}`);
    if (!fs.existsSync(currFile + '.png') || !fs.existsSync(currFile + '.json')) continue;

    if (numbersToRemove.includes(i)) {
      fs.unlinkSync(currFile + '.png')
      fs.unlinkSync(currFile + '.json')
    } else {
      fs.renameSync(currFile + '.png', path.join(filesDirectory, `${nftNumber}.png`))
      fs.renameSync(currFile + '.json', path.join(filesDirectory, `${nftNumber}.json`))
      nftNumber++;
    }
  }
  return true;
}

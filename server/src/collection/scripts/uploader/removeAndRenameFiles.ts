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
    if (
      !fs.existsSync(path.join(filesDirectory, `images/${i}`)) ||
      !fs.existsSync(path.join(filesDirectory, `jsons/${i}`))
    )
      continue;

    if (numbersToRemove.includes(i)) {
      fs.unlinkSync(path.join(filesDirectory, `images/${i}`));
      fs.unlinkSync(path.join(filesDirectory, `jsons/${i}`));
    } else {
      fs.renameSync(
        path.join(filesDirectory, `images/${i}`),
        path.join(filesDirectory, `images/${nftNumber}`),
      );
      fs.renameSync(
        path.join(filesDirectory, `jsons/${i}`),
        path.join(filesDirectory, `jsons/${nftNumber}`),
      );
      nftNumber++;
    }
  }
  return true;
}

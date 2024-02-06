import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  statSync,
  unlinkSync,
} from 'fs';
import { join } from 'path';

function copyDirSync(src, dest) {
  const exists = existsSync(src);
  const stats = exists && statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    readdirSync(src).forEach(function (childItemName) {
      copyDirSync(join(src, childItemName), join(dest, childItemName));
    });
  } else {
    copyFileSync(src, dest);
  }
}

function emptyDirSync(path) {
  const pathContents = readdirSync(path);

  for (const fileOrDirPath of pathContents) {
    try {
      const currPath = join(path, fileOrDirPath);
      const stat = statSync(currPath);
      if (stat.isDirectory()) {
        if (readdirSync(currPath).length) emptyDirSync(currPath);
        rmdirSync(currPath);
      } else unlinkSync(currPath);
    } catch (e) {
      console.error(e.message);
    }
  }
}

export { copyDirSync, emptyDirSync };

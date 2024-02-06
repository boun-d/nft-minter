import { Document } from 'mongoose';

export enum CollectionStatus {
  CREATED = 'CREATED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  UPLOADING = 'UPLOADING',
  UPLOADED = 'UPLOADED',
  DEPLOYED = 'DEPLOYED',
}

export interface Collection extends Document {
  readonly collectionId: string;
  readonly collectionName: string;
  readonly collectionSize: number;
  readonly collectionStatus: CollectionStatus;

  readonly contractAddress: string
  readonly imagesDirectoryHash: string
  readonly jsonFilesDirectoryHash: string;

  //Minting page gif
  readonly gifDirectoryHash: string;
  //Minting page background image
  readonly backgroundImageDirectoryHash: string;
  //Minting page website link
  readonly website: string;
}

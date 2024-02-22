import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Express } from 'express';
import {
  AgendaHandle as DefineJob,
  AgendaService,
} from '@sigmaott/nestjs-agenda';
import { Job } from 'agenda';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Model } from 'mongoose';

const axios = require('axios');
const FormData = require('form-data');

import {
  NFTS_DIR_NAME,
  UPLOADED_IMAGES_DIR_NAME,
  UPLOADED_LAYERS_DIR_NAME,
} from './constants';

import { CollectionDTO } from './dto/collection.dto';
import {
  Collection,
  CollectionStatus,
} from './interfaces/collection.interface';
import { copyDirSync, emptyDirSync } from './utils/file-system-utils';
import { ConfigService } from '@nestjs/config';

const { Worker, isMainThread } = require('worker_threads');
const dbQueryFilter = '-__v -_id';

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel('Collection')
    private readonly collectionModel: Model<Collection>,
    private readonly queue: AgendaService,
    private readonly config: ConfigService,
  ) {
    queue.maxConcurrency(1);
  }

  async findAll(
    collectionStatus: CollectionStatus[],
    publicAddress?: string,
  ): Promise<Collection[]> {
    let query = {};
    if (collectionStatus?.length) {
      query['collectionStatus'] = { $in: collectionStatus };
    }
    if (!!publicAddress) {
      query['collectionOwner'] = { $eq: publicAddress };
    }
    return this.collectionModel.find(query).select(dbQueryFilter);
  }

  async findOne(collectionId: string): Promise<Collection | undefined> {
    return this.collectionModel.findOne({ collectionId }).select(dbQueryFilter);
  }

  async updateCollectionStatus(
    collectionId: string,
    collectionStatus: CollectionStatus,
  ): Promise<boolean> {
    const result = await this.collectionModel
      .findOneAndUpdate(
        {
          collectionId,
        },
        { collectionStatus },
      )
      .exec();
    return !!result;
  }

  async updateCollectionStatusViaQueue(
    collectionId: string,
    collectionStatus: CollectionStatus,
  ): Promise<boolean> {
    this.queue.now('UPDATE_COLLECTION_STATUS', {
      collectionId,
      collectionStatus,
    });
    return true;
  }

  async increaseCollectionSize(
    collectionId: string,
    valueToIncreaseBy: number,
  ): Promise<boolean> {
    const collection = await this.collectionModel
      .findOne({ collectionId })
      .exec();
    const result = await this.collectionModel
      .findOneAndUpdate(
        {
          collectionId,
        },
        { collectionSize: collection.collectionSize + valueToIncreaseBy },
      )
      .exec();
    return !!result;
  }

  async decreaseCollectionSize(
    collectionId: string,
    valueToDecreaseBy: number,
  ): Promise<boolean> {
    const collection = await this.collectionModel
      .findOne({ collectionId })
      .exec();
    const result = await this.collectionModel
      .findOneAndUpdate(
        {
          collectionId,
        },
        { collectionSize: collection.collectionSize - valueToDecreaseBy },
      )
      .exec();
    return !!result;
  }

  async saveIPFSDirectoryHashes(
    collectionId: string,
    imagesDirectoryHash: string,
    jsonFilesDirectoryHash: string,
  ): Promise<boolean> {
    const result = await this.collectionModel
      .findOneAndUpdate(
        {
          collectionId,
        },
        { imagesDirectoryHash, jsonFilesDirectoryHash },
      )
      .exec();
    return !!result;
  }

  async setContractAddress(
    collectionId: string,
    contractAddress: string,
  ): Promise<boolean> {
    const result = await this.collectionModel
      .findOneAndUpdate(
        {
          collectionId,
        },
        { contractAddress },
      )
      .exec();
    return !!result;
  }

  async remove(collectionId: string): Promise<boolean> {
    const result = await this.collectionModel.findOneAndDelete({
      collectionId,
    });
    return !!result;
  }

  async create(collection: CollectionDTO): Promise<string> {
    const collectionId = randomUUID();
    const { collectionName, collectionOwner } = collection;

    const result = await this.collectionModel.create({
      collectionId,
      collectionName,
      collectionOwner,
      collectionSize: 0,
      collectionStatus: CollectionStatus.CREATED,
      contractAddress: null,
    });

    return result.collectionId;
  }

  async generateArtwork(
    collectionId: string,
    collectionSize: number,
  ): Promise<boolean> {
    const result = await this.updateCollectionStatus(
      collectionId,
      CollectionStatus.PROCESSING,
    );
    this.queue.now('GENERATE_ARTWORK', {
      collectionId,
      collectionSize,
    });
    return result;
  }

  async uploadArtwork(
    collectionId: string,
    numberOfImages: number,
  ): Promise<boolean> {
    const result = await this.updateCollectionStatus(
      collectionId,
      CollectionStatus.PROCESSING,
    );
    this.queue.now('UPLOAD_ARTWORK', {
      collectionId,
      numberOfImages,
    });
    return result;
  }

  async syncFilesWithIPFS(
    collectionId: string,
    numbersToRemove: number[],
  ): Promise<boolean> {
    const result = await this.updateCollectionStatus(
      collectionId,
      CollectionStatus.UPLOADING,
    );
    const collection = await this.findOne(collectionId);
    this.queue.now('SYNC_FILES_WITH_IPFS', {
      collectionId,
      collectionSize: collection.collectionSize,
      collectionName: collection.collectionName,
      numbersToRemove,
    });
    return result;
  }

  async saveImageAgainstCollection(
    collectionId: string,
    image: Express.Multer.File,
    key: 'backgroundImageDirectoryHash' | 'gifDirectoryHash',
  ) {
    const formData = new FormData();
    formData.append('file', Buffer.from(image.buffer));

    const secret = this.config.get('IPFS_GATEWAY_SECRET');
    const auth = 'Bearer ' + secret;

    const result = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          ...formData.getHeaders(),
          Authorization: auth,
        },
      },
    );
    if (result.status === 200) {
      await this.collectionModel
        .findOneAndUpdate(
          {
            collectionId,
          },
          { [key]: result.data.Hash },
        )
        .exec();
      return true;
    }
    return false;
  }

  async setCollectionWebsiteLink(
    collectionId: string,
    website: string,
  ): Promise<boolean> {
    const result = await this.collectionModel
      .findOneAndUpdate(
        {
          collectionId,
        },
        { website },
      )
      .exec();
    return !!result;
  }

  /******************************************************************************************\
                                            JOBS
  \******************************************************************************************/

  @DefineJob({ name: 'GENERATE_ARTWORK', concurrency: 1 })
  async generateCollectionJob(job: Job, done: () => void) {
    const { collectionId, collectionSize } = job.attrs.data;

    const emptyDirectories = () => {
      emptyDirSync(path.join(__dirname, NFTS_DIR_NAME));
      emptyDirSync(path.join(__dirname, UPLOADED_LAYERS_DIR_NAME));
    };

    const handleError = async () => {
      await this.updateCollectionStatusViaQueue(
        collectionId,
        CollectionStatus.CREATED,
      );
      this.queue.now('PURGE_PUBLIC_DIRECTORY', { collectionId });
      emptyDirectories();
    };

    if (isMainThread) {
      const worker = new Worker(
        path.join(__dirname, 'scripts/artwork-generator/main'),
        {
          workerData: { collectionSize },
        },
      );
      worker.on('error', async () => {
        await handleError();
      });
      worker.on('message', async (r) => console.log(r));
      worker.on('exit', async (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
          await handleError();
        } else {
          const destination = path.join(
            __dirname,
            '../..',
            'public',
            collectionId,
          );
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }
          const nftsFolder = path.join(__dirname, NFTS_DIR_NAME);
          copyDirSync(nftsFolder, destination);
          emptyDirectories();

          await this.increaseCollectionSize(collectionId, collectionSize);
        }
        await job.remove();
        done();
      });
    }
  }

  @DefineJob({ name: 'UPLOAD_ARTWORK', concurrency: 1 })
  async uploadCollectionJob(job: Job, done: () => void) {
    const { collectionId, numberOfImages } = job.attrs.data;

    const emptyDirectories = () => {
      emptyDirSync(path.join(__dirname, NFTS_DIR_NAME));
      emptyDirSync(path.join(__dirname, UPLOADED_IMAGES_DIR_NAME));
    };

    const handleError = async () => {
      await this.updateCollectionStatusViaQueue(
        collectionId,
        CollectionStatus.CREATED,
      );
      this.queue.now('PURGE_PUBLIC_DIRECTORY', { collectionId });
      emptyDirectories();
    };

    if (isMainThread) {
      const collection = await this.findOne(collectionId);
      const startingNumber = collection.collectionSize + 1;
      const worker = new Worker(
        path.join(__dirname, 'scripts/json-generator/main'),
        {
          workerData: { startingNumber },
        },
      );
      worker.on('error', async () => {
        await handleError();
      });
      worker.on('exit', async (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
          await handleError();
        } else {
          const destination = path.join(
            __dirname,
            '../..',
            'public',
            collectionId,
          );
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }
          const nftsFolder = path.join(__dirname, NFTS_DIR_NAME);
          copyDirSync(nftsFolder, destination);
          emptyDirectories();
          await this.increaseCollectionSize(collectionId, numberOfImages);
        }
        await job.remove();
        done();
      });
    }
  }

  @DefineJob({ name: 'UPDATE_COLLECTION_STATUS', concurrency: 1 })
  async updateCollectionStatusJob(job: Job, done: () => void) {
    const { collectionId, collectionStatus } = job.attrs.data;
    await this.collectionModel
      .findOneAndUpdate(
        {
          collectionId,
        },
        { collectionStatus },
      )
      .exec();
    await job.remove();
    done();
  }

  @DefineJob({ name: 'PURGE_PUBLIC_DIRECTORY', concurrency: 1 })
  async purgeTempDirectoriesJob(job: Job, done: () => void) {
    const { collectionId } = job.attrs.data;

    const folderToDelete = path.join(
      __dirname,
      '../..',
      'public',
      collectionId,
    );
    if (!!collectionId && fs.existsSync(folderToDelete)) {
      emptyDirSync(folderToDelete);
      fs.rmdirSync(folderToDelete);
    }

    await job.remove();
    done();
  }

  @DefineJob({ name: 'SYNC_FILES_WITH_IPFS', concurrency: 1 })
  async syncFilesWithIPFSJob(job: Job, done: () => void) {
    if (!isMainThread) return;

    const { collectionId, collectionSize, collectionName, numbersToRemove } =
      job.attrs.data;

    const worker = new Worker(path.join(__dirname, 'scripts/uploader/main'), {
      workerData: {
        collectionId,
        collectionSize,
        collectionName,
        numbersToRemove,
        ipfsGatewaySecret: this.config.get('IPFS_GATEWAY_SECRET'),
      },
    });
    
    worker.on('error', () => {
      this.updateCollectionStatus(collectionId, CollectionStatus.PROCESSED);
    });

    worker.on('message', async (result) => {
      if (!result) return;
      await this.saveIPFSDirectoryHashes(
        collectionId,
        result.imagesDirectoryHash,
        result.jsonFilesDirectoryHash,
      );
    });

    worker.on('exit', async (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
        this.updateCollectionStatus(collectionId, CollectionStatus.PROCESSED);
      } else {
        const folderToDelete = path.join(
          __dirname,
          '../..',
          'public',
          collectionId,
        );
        emptyDirSync(folderToDelete);
        fs.rmdirSync(folderToDelete);
        await this.decreaseCollectionSize(collectionId, numbersToRemove.length);
        await this.updateCollectionStatus(
          collectionId,
          CollectionStatus.UPLOADED,
        );
      }
      await job.remove();
      done();
    });
  }
}

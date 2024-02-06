import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AgendaService } from '@sigmaott/nestjs-agenda';
import { Mode } from 'fs';
import { Model } from 'mongoose';
import { CollectionService } from './collection.service';
import {
  Collection,
  CollectionStatus,
} from './interfaces/collection.interface';

import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
const axios = require('axios');

describe('CollectionService', () => {
  let collectionService: CollectionService;
  let queue: AgendaService;
  let collectionModel: Model<Collection>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
        {
          provide: getModelToken('Collection'),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            select: jest.fn(),
            create: jest.fn(),
          },
        },
        AgendaService,
        ConfigService
      ],
    }).compile();

    collectionService = module.get<CollectionService>(CollectionService);
    queue = module.get<AgendaService>(AgendaService);
    collectionModel = module.get<Model<Collection>>(
      getModelToken('Collection'),
    );
  });

  it('should be defined', () => {
    expect(collectionService).toBeDefined();
  });

  describe('findAll', () => {
    it('should call find function on model with collection status query if present', async () => {
      const findSpy = jest
        .spyOn(collectionModel, 'find')
        .mockReturnValueOnce({ select: jest.fn() } as any);
      await collectionService.findAll([CollectionStatus.DEPLOYED], undefined);

      expect(findSpy).toHaveBeenCalledWith({
        collectionStatus: { $in: ['DEPLOYED'] },
      });
    });
    it('should call find function on model with public address query if present', async () => {
      const findSpy = jest
        .spyOn(collectionModel, 'find')
        .mockReturnValueOnce({ select: jest.fn() } as any);
      await collectionService.findAll([], 'publicAddress');

      expect(findSpy).toHaveBeenCalledWith({
        collectionOwner: { $eq: 'publicAddress' },
      });
    });
  });
  describe('updateCollectionStatus', () => {
    it('should call successfully', async () => {
      const findOneAndUpdateSpy = jest
        .spyOn(collectionModel, 'findOneAndUpdate')
        .mockReturnValueOnce({ exec: jest.fn() } as any);
      await collectionService.updateCollectionStatus(
        'collectionId',
        CollectionStatus.DEPLOYED,
      );

      expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
        {
          collectionId: 'collectionId',
        },
        { collectionStatus: CollectionStatus.DEPLOYED },
      );
    });
  });
  describe('updateCollectionStatusViaQueue', () => {
    it('should call successfully', async () => {
      const queueSpy = jest
        .spyOn(queue, 'now')
        .mockImplementationOnce(jest.fn());
      await collectionService.updateCollectionStatusViaQueue(
        'collectionId',
        CollectionStatus.DEPLOYED,
      );

      expect(queueSpy).toHaveBeenCalledWith('UPDATE_COLLECTION_STATUS', {
        collectionId: 'collectionId',
        collectionStatus: CollectionStatus.DEPLOYED,
      });
    });
  });
  describe('increaseCollectionSize', () => {
    it('should call successfully', async () => {
      const findOneSpy = jest
        .spyOn(collectionModel, 'findOne')
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce({ collectionSize: 10 }),
        } as any);
      const findOneAndUpdateSpy = jest
        .spyOn(collectionModel, 'findOneAndUpdate')
        .mockReturnValueOnce({ exec: jest.fn() } as any);
      await collectionService.increaseCollectionSize('collectionId', 1);

      expect(findOneSpy).toHaveBeenCalledWith({
        collectionId: 'collectionId',
      });
      expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
        {
          collectionId: 'collectionId',
        },
        { collectionSize: 11 },
      );
    });
  });
  describe('decreaseCollectionSize', () => {
    it('should call successfully', async () => {
      const findOneSpy = jest
        .spyOn(collectionModel, 'findOne')
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce({ collectionSize: 10 }),
        } as any);
      const findOneAndUpdateSpy = jest
        .spyOn(collectionModel, 'findOneAndUpdate')
        .mockReturnValueOnce({ exec: jest.fn() } as any);
      await collectionService.decreaseCollectionSize('collectionId', 1);

      expect(findOneSpy).toHaveBeenCalledWith({
        collectionId: 'collectionId',
      });
      expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
        {
          collectionId: 'collectionId',
        },
        { collectionSize: 9 },
      );
    });
  });
  describe('saveIPFSDirectoryHashes', () => {
    it('should call successfully', async () => {
      const findOneAndUpdateSpy = jest
        .spyOn(collectionModel, 'findOneAndUpdate')
        .mockReturnValueOnce({ exec: jest.fn() } as any);
      await collectionService.saveIPFSDirectoryHashes(
        'collectionId',
        'imagesDirectoryHash',
        'jsonFilesDirectoryHash',
      );

      expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
        {
          collectionId: 'collectionId',
        },
        {
          imagesDirectoryHash: 'imagesDirectoryHash',
          jsonFilesDirectoryHash: 'jsonFilesDirectoryHash',
        },
      );
    });
  });
  describe('create', () => {
    it('should call successfully', async () => {
      jest.spyOn(crypto, 'randomUUID').mockReturnValueOnce('uuid');
      const createSpy = jest
        .spyOn(collectionModel, 'create')
        .mockReturnValueOnce({ collectionId: 'uuid' } as any);
      await collectionService.create({
        collectionName: 'collectionName',
        collectionOwner: 'collectionOwner',
      });

      expect(createSpy).toHaveBeenCalledWith({
        collectionId: 'uuid',
        collectionName: 'collectionName',
        collectionOwner: 'collectionOwner',
        collectionSize: 0,
        collectionStatus: CollectionStatus.CREATED,
        contractAddress: null,
      });
    });
  });
  describe('generateArtwork', () => {
    it('should call successfully', async () => {
      const updateCollectionStatusSpy = jest
        .spyOn(collectionService, 'updateCollectionStatus')
        .mockResolvedValueOnce(true);
      const queueSpy = jest
        .spyOn(queue, 'now')
        .mockImplementationOnce(jest.fn());
      await collectionService.generateArtwork('collectionId', 10);

      expect(updateCollectionStatusSpy).toHaveBeenCalledWith(
        'collectionId',
        CollectionStatus.PROCESSING,
      );
      expect(queueSpy).toHaveBeenCalledWith('GENERATE_ARTWORK', {
        collectionId: 'collectionId',
        collectionSize: 10,
      });
    });
  });
  describe('uploadArtwork', () => {
    it('should call successfully', async () => {
      const updateCollectionStatusSpy = jest
        .spyOn(collectionService, 'updateCollectionStatus')
        .mockResolvedValueOnce(true);
      const queueSpy = jest
        .spyOn(queue, 'now')
        .mockImplementationOnce(jest.fn());
      await collectionService.uploadArtwork('collectionId', 10);

      expect(updateCollectionStatusSpy).toHaveBeenCalledWith(
        'collectionId',
        CollectionStatus.PROCESSING,
      );
      expect(queueSpy).toHaveBeenCalledWith('UPLOAD_ARTWORK', {
        collectionId: 'collectionId',
        numberOfImages: 10,
      });
    });
  });
  describe('syncFilesWithIPFS', () => {
    it('should call successfully', async () => {
      const updateCollectionStatusSpy = jest
        .spyOn(collectionService, 'updateCollectionStatus')
        .mockResolvedValueOnce(true);
      jest.spyOn(collectionService, 'findOne').mockReturnValueOnce({
        collectionSize: 10,
        collectionName: 'collectionName',
      } as any);
      const queueSpy = jest
        .spyOn(queue, 'now')
        .mockImplementationOnce(jest.fn());
      await collectionService.syncFilesWithIPFS('collectionId', [1]);

      expect(updateCollectionStatusSpy).toHaveBeenCalledWith(
        'collectionId',
        CollectionStatus.UPLOADING,
      );
      expect(queueSpy).toHaveBeenCalledWith('SYNC_FILES_WITH_IPFS', {
        collectionId: 'collectionId',
        collectionSize: 10,
        collectionName: 'collectionName',
        numbersToRemove: [1],
      });
    });
  });
  describe('saveImageAgainstCollection', () => {
    it('should call successfully', async () => {
      const postMock = jest.fn();
      const axiosPostSpy = jest
        .spyOn(axios, 'post')
        .mockImplementation(
          jest.fn(() => ({ status: 200, data: { Hash: 'abcedf' } })),
        );
      const findOneAndUpdateSpy = jest
        .spyOn(collectionModel, 'findOneAndUpdate')
        .mockReturnValueOnce({ exec: jest.fn() } as any);
      await collectionService.saveImageAgainstCollection(
        'collectionId',
        { buffer: 'buffer' } as any,
        'backgroundImageDirectoryHash',
      );

      expect(axiosPostSpy).toHaveBeenCalledWith(
        'https://ipfs.infura.io:5001/api/v0/add',
        expect.objectContaining({ dataSize: 0 }),
        expect.objectContaining({
          params: {
            'cid-version': 1,
            has: 'sha2-256',
          },
          maxBodyLength: Infinity,
        }),
      );
    });
  });
});

import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AgendaService } from '@sigmaott/nestjs-agenda';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';

import { emptyDirSync } from './utils/file-system-utils';

jest.mock('./utils/file-system-utils', () => ({
  emptyDirSync: jest.fn(),
}));

const mockEmptyDirSync = emptyDirSync as jest.Mock;

describe('CollectionController', () => {
  let collectionController: CollectionController;
  let collectionService: CollectionService;

  const mockResponseObject = () => {
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
      send: jest.fn(),
    };
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionController],
      providers: [
        CollectionService,
        {
          provide: getModelToken('Collection'),
          useValue: {},
        },
        AgendaService,
        ConfigService
      ],
    }).compile();

    collectionController =
      module.get<CollectionController>(CollectionController);
    collectionService = module.get<CollectionService>(CollectionService);
  });

  it('should be defined', () => {
    expect(collectionController).toBeDefined();
    expect(collectionService).toBeDefined();
  });
  describe('getCollections', () => {
    it('should return collection and OK status if request is valid', async () => {
      const data: any = new Promise((resolve) =>
        resolve([{ collectionId: 'collectionId' }]),
      );
      jest
        .spyOn(collectionService, 'findAll')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.getCollections(
        [],
        'collectionId',
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith([{ collectionId: 'collectionId' }]);
    });
    it('should return BAD_REQUEST if collection status provided are not valid', async () => {
      const res = mockResponseObject();
      const result = await collectionController.getCollections(
        ['NOT_A_VALID_STATUS' as any],
        'collectionId',
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        "The collection status' you provided are not valid.",
      );
    });
  });
  describe('getCollection', () => {
    it('should return OK if collection is found', async () => {
      const data: any = new Promise((resolve) =>
        resolve({ collectionId: 'collectionId' }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.getCollection(
        'collectionId',
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ collectionId: 'collectionId' });
    });
    it('should return NOT_FOUND if collection is NOT found', async () => {
      const data: any = new Promise((resolve) => resolve(undefined));
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.getCollection(
        'collectionId',
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalled();
    });
  });
  describe('getDeployedCollection', () => {
    it('should return only relevant fields with OK status if collection is found', async () => {
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionName: 'collectionName',
          collectionStatus: 'DEPLOYED',
          contractAddress: 'contractAddress',
          gifDirectoryHash: 'gifDirectoryHash',
          backgroundImageDirectoryHash: 'backgroundImageDirectoryHash',
          website: 'website',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.getDeployedCollection(
        'collectionId',
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        collectionId: 'collectionId',
        collectionName: 'collectionName',
        contractAddress: 'contractAddress',
        gifDirectoryHash: 'gifDirectoryHash',
        backgroundImageDirectoryHash: 'backgroundImageDirectoryHash',
        website: 'website',
      });
      expect(res.json).toHaveBeenCalledWith(
        expect.not.objectContaining({ collectionStatus: 'DEPLOYED' }),
      );
    });
    it('should return NOT_FOUND if collection is NOT found', async () => {
      const data: any = new Promise((resolve) => resolve(undefined));
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.getDeployedCollection(
        'collectionId',
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalled();
    });
    it('should return NOT_FOUND if collection is NOT in DEPLOYED status', async () => {
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'NOT_DEPLOYED',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.getDeployedCollection(
        'collectionId',
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalled();
    });
  });
  describe('getCollectionStatus', () => {
    it('should return the collection status if collection is found', async () => {
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'collectionStatus',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.getCollectionStatus(
        'collectionId',
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('collectionStatus');
    });
    it('should return NOT_FOUND if collection is NOT found', async () => {
      const data: any = new Promise((resolve) => resolve(undefined));
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.getCollectionStatus(
        'collectionId',
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalled();
    });
  });
  describe('updateCollectionStatus', () => {
    it('should return OK if collection status if updated successfully using queue', async () => {
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'collectionStatus',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);
      jest
        .spyOn(collectionService, 'updateCollectionStatusViaQueue')
        .mockImplementationOnce(() => new Promise((resolve) => resolve(true)));

      const res = mockResponseObject();
      const result = await collectionController.updateCollectionStatus(
        'collectionId',
        true,
        { collectionStatus: 'CREATED' },
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalled();
    });
    it('should return OK if collection status if updated successfully NOT using queue', async () => {
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'collectionStatus',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);
      jest
        .spyOn(collectionService, 'updateCollectionStatus')
        .mockImplementationOnce(() => new Promise((resolve) => resolve(true)));

      const res = mockResponseObject();
      const result = await collectionController.updateCollectionStatus(
        'collectionId',
        false,
        { collectionStatus: 'CREATED' },
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalled();
    });
    it('should return BAD_REQUEST if collection status is NOT valid', async () => {
      const res = mockResponseObject();
      const result = await collectionController.updateCollectionStatus(
        'collectionId',
        false,
        { collectionStatus: 'NOT_A_VALID_STATUS' },
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalled();
    });
    it('should return NOT_FOUND if collection is NOT found', async () => {
      const data: any = new Promise((resolve) => resolve(undefined));
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.updateCollectionStatus(
        'collectionId',
        false,
        { collectionStatus: 'CREATED' },
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalled();
    });
    it('should return BAD_REQUEST if collection status could NOT be updated', async () => {
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'collectionStatus',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);
      jest
        .spyOn(collectionService, 'updateCollectionStatus')
        .mockImplementationOnce(() => new Promise((resolve) => resolve(false)));

      const res = mockResponseObject();
      const result = await collectionController.updateCollectionStatus(
        'collectionId',
        false,
        { collectionStatus: 'CREATED' },
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalled();
    });
  });
  describe('createCollection', () => {
    it('should return CREATED if collection is created successfully', async () => {
      const data: any = new Promise((resolve) => resolve('collectionId'));
      jest
        .spyOn(collectionService, 'create')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.createCollection(
        {
          collectionName: 'collectionName',
          collectionOwner: 'collectionOwner',
        },
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith('collectionId');
    });
    it('should return BAD_REQUEST if create does not return a collectionId', async () => {
      const data: any = new Promise((resolve) => resolve(undefined));
      jest
        .spyOn(collectionService, 'create')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.createCollection(
        {
          collectionName: 'collectionName',
          collectionOwner: 'collectionOwner',
        },
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalled();
    });
  });
  describe('generateArtworkAndAddToCollection', () => {
    afterEach(() => {
      mockEmptyDirSync.mockReset();
    });
    it('should return OK if generate artwork is called successfully', async () => {
      const mockFiles = Array.from({ length: 25 }).map(() => {}) as any;
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'CREATED',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);
      jest
        .spyOn(collectionService, 'generateArtwork')
        .mockImplementationOnce(() => new Promise((resolve) => resolve(true)));

      const res = mockResponseObject();
      const result =
        await collectionController.generateArtworkAndAddToCollection(
          'collectionId',
          mockFiles,
          {
            collectionSize: 100,
          },
          res,
        );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalled();
      expect(mockEmptyDirSync).not.toHaveBeenCalled();
    });
    it('should return BAD_REQUEST if collection size is NOT provided', async () => {
      const mockFiles = Array.from({ length: 25 }).map(() => {}) as any;

      const res = mockResponseObject();
      const result =
        await collectionController.generateArtworkAndAddToCollection(
          'collectionId',
          mockFiles,
          {
            collectionSize: undefined,
          },
          res,
        );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalled();
      expect(mockEmptyDirSync).toHaveBeenCalled();
    });
    it('should return BAD_REQUEST if provided layers are of length less than 25', async () => {
      const mockFiles = Array.from({ length: 24 }).map(() => {}) as any;

      const res = mockResponseObject();
      const result =
        await collectionController.generateArtworkAndAddToCollection(
          'collectionId',
          mockFiles,
          {
            collectionSize: 100,
          },
          res,
        );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalled();
      expect(mockEmptyDirSync).toHaveBeenCalled();
    });
    it('should return NOT_FOUND if collection cannot be found', async () => {
      const mockFiles = Array.from({ length: 25 }).map(() => {}) as any;
      const data: any = new Promise((resolve) => resolve(undefined));
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result =
        await collectionController.generateArtworkAndAddToCollection(
          'collectionId',
          mockFiles,
          {
            collectionSize: 100,
          },
          res,
        );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalled();
      expect(mockEmptyDirSync).toHaveBeenCalled();
    });
    it('should return BAD_REQUEST if collection is not of status CREATED or PROCESSING', async () => {
      const mockFiles = Array.from({ length: 25 }).map(() => {}) as any;
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'PROCESSED',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result =
        await collectionController.generateArtworkAndAddToCollection(
          'collectionId',
          mockFiles,
          {
            collectionSize: 100,
          },
          res,
        );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalled();
      expect(mockEmptyDirSync).toHaveBeenCalled();
    });
    it('should return BAD_REQUEST if generate artwork is called unsuccessfully', async () => {
      const mockFiles = Array.from({ length: 25 }).map(() => {}) as any;
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'CREATED',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);
      jest
        .spyOn(collectionService, 'generateArtwork')
        .mockImplementationOnce(() => new Promise((resolve) => resolve(false)));

      const res = mockResponseObject();
      const result =
        await collectionController.generateArtworkAndAddToCollection(
          'collectionId',
          mockFiles,
          {
            collectionSize: 100,
          },
          res,
        );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalled();
      expect(mockEmptyDirSync).toHaveBeenCalled();
    });
  });
  describe('uploadArtworkAndAddToCollection', () => {
    it('should return OK if uploadArtwork is called successfully', async () => {
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'CREATED',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);
      jest
        .spyOn(collectionService, 'uploadArtwork')
        .mockImplementationOnce(() => new Promise((resolve) => resolve(true)));

      const res = mockResponseObject();
      const result = await collectionController.uploadArtworkAndAddToCollection(
        'collectionId',
        [{} as any],
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalled();
      expect(mockEmptyDirSync).not.toHaveBeenCalled();
    });
    it('should return NOT_FOUND if collection is NOT found', async () => {
      const data: any = new Promise((resolve) => resolve(undefined));
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.uploadArtworkAndAddToCollection(
        'collectionId',
        [{} as any],
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalled();
      expect(mockEmptyDirSync).toHaveBeenCalled();
    });
    it('should return BAD_REQUEST if collection status is NOT valid', async () => {
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'PROCESSED',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.uploadArtworkAndAddToCollection(
        'collectionId',
        [{} as any],
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalled();
      expect(mockEmptyDirSync).toHaveBeenCalled();
    });
    it('should return BAD_REQUEST if uploadArtwork is NOT called successfully', async () => {
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'CREATED',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);
      jest
        .spyOn(collectionService, 'uploadArtwork')
        .mockImplementationOnce(() => new Promise((resolve) => resolve(false)));

      const res = mockResponseObject();
      const result = await collectionController.uploadArtworkAndAddToCollection(
        'collectionId',
        [{} as any],
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalled();
      expect(mockEmptyDirSync).toHaveBeenCalled();
    });
  });
  describe('syncCollectionWithIPFSIPFS', () => {
    it('should return OK if syncFilesWithIPFS is called successfully', async () => {
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'PROCESSED',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);
      jest
        .spyOn(collectionService, 'syncFilesWithIPFS')
        .mockImplementationOnce(() => new Promise((resolve) => resolve(true)));

      const res = mockResponseObject();
      const result = await collectionController.syncCollectionWithIPFSIPFS(
        'collectionId',
        { numbersToRemove: [0, 1, 2] },
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalled();
    });
    it('should return NOT_FOUND if collection is NOT found', async () => {
      const data: any = new Promise((resolve) =>
        resolve(undefined),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.syncCollectionWithIPFSIPFS(
        'collectionId',
        { numbersToRemove: [0, 1, 2] },
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalled();
    });
    it('should return BAD_REQUEST if collection status is CREATED or PROCESSING', async () => {
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'CREATED',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.syncCollectionWithIPFSIPFS(
        'collectionId',
        { numbersToRemove: [0, 1, 2] },
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Collection cannot be uploaded yet.');
    });
    it('should return BAD_REQUEST if collection status is UPLOADING', async () => {
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'UPLOADING',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.syncCollectionWithIPFSIPFS(
        'collectionId',
        { numbersToRemove: [0, 1, 2] },
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Collection being uploaded already.');
    });
    it('should return BAD_REQUEST if collection status is UPLOADED or DEPLOYED', async () => {
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'UPLOADED',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await collectionController.syncCollectionWithIPFSIPFS(
        'collectionId',
        { numbersToRemove: [0, 1, 2] },
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Collection already uploaded.');
    });
    it('should return BAD_REQUEST if syncFilesWithIPFS is NOT called successfully', async () => {
      const data: any = new Promise((resolve) =>
        resolve({
          collectionId: 'collectionId',
          collectionStatus: 'PROCESSED',
        }),
      );
      jest
        .spyOn(collectionService, 'findOne')
        .mockImplementationOnce(() => data);
      jest
        .spyOn(collectionService, 'syncFilesWithIPFS')
        .mockImplementationOnce(() => new Promise((resolve) => resolve(false)));

      const res = mockResponseObject();
      const result = await collectionController.syncCollectionWithIPFSIPFS(
        'collectionId',
        { numbersToRemove: [0, 1, 2] },
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalled();
    });
  });
});

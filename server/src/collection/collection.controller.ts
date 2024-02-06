import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UnsupportedMediaTypeException,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

import { EnforceEmptyDirectoryInterceptor } from './utils/enforce-empty-directory.interceptor';

import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role/roles.guard';
import { Role } from 'src/auth/role/role.enum';
import {
  Collection,
  CollectionStatus,
} from './interfaces/collection.interface';
import { CollectionService } from './collection.service';
import { CollectionDTO } from './dto/collection.dto';
import { UploadToIpfsDTO } from './dto/uploadToIPFS.dto';
import {
  UPLOADED_IMAGES_DIR_NAME,
  UPLOADED_LAYERS_DIR_NAME,
} from './constants';
import {
  createArtworkDestinationResolver,
  createArtworkFilenameResolver,
  fileTypeResolver,
} from './utils/interceptor-resolvers';
import { emptyDirSync } from './utils/file-system-utils';

const NOT_FOUND_MESSAGE =
  'A collection with that collection ID does not exist.';

@Controller()
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get('/collections')
  @UseGuards(RolesGuard([Role.ADMIN, Role.COLLECTION_OWNER]))
  @UseGuards(JwtAuthGuard)
  async getCollections(
    @Query('collectionStatus')
    collectionStatus: CollectionStatus | CollectionStatus[],
    @Query('publicAddress') publicAddress: string,
    @Res() res,
  ): Promise<Collection[]> {
    const statuses = Array.isArray(collectionStatus)
      ? collectionStatus
      : !!collectionStatus
      ? [collectionStatus]
      : [];
    if (statuses?.length) {
      const isValidStatusPredicate = statuses.every((collectionStatus) =>
        Object.values(CollectionStatus).includes(collectionStatus),
      );

      if (!isValidStatusPredicate) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send("The collection status' you provided are not valid.");
      }
    }

    const result = await this.collectionService.findAll(
      statuses,
      publicAddress,
    );
    return res.status(HttpStatus.OK).send(result);
  }

  @Get('/collection/:collectionId')
  @UseGuards(RolesGuard([Role.ADMIN, Role.COLLECTION_OWNER]))
  @UseGuards(JwtAuthGuard)
  async getCollection(
    @Param('collectionId') collectionId: string,
    @Res() res,
  ): Promise<Collection> {
    const collection = await this.collectionService.findOne(collectionId);

    if (!collection) {
      return res.status(HttpStatus.NOT_FOUND).send(NOT_FOUND_MESSAGE);
    }
    return res.status(HttpStatus.OK).json(collection);
  }

  @Get('/collection/deployed/:collectionId')
  async getDeployedCollection(
    @Param('collectionId') collectionId: string,
    @Res() res,
  ): Promise<Collection> {
    const collection = await this.collectionService.findOne(collectionId);

    if (!collection || collection.collectionStatus !== 'DEPLOYED') {
      return res.status(HttpStatus.NOT_FOUND).send(NOT_FOUND_MESSAGE);
    }

    const {
      collectionName,
      collectionSize,
      contractAddress,
      gifDirectoryHash,
      backgroundImageDirectoryHash,
      website,
    } = collection;
    return res.status(HttpStatus.OK).json({
      collectionId,
      collectionName,
      collectionSize,
      contractAddress,
      gifDirectoryHash,
      backgroundImageDirectoryHash,
      website,
    });
  }

  @Get('/collection/:collectionId/status')
  @UseGuards(RolesGuard([Role.ADMIN, Role.COLLECTION_OWNER]))
  @UseGuards(JwtAuthGuard)
  async getCollectionStatus(
    @Param('collectionId') collectionId: string,
    @Res() res,
  ): Promise<any> {
    const collection = await this.collectionService.findOne(collectionId);

    if (!collection) {
      return res.status(HttpStatus.NOT_FOUND).send(NOT_FOUND_MESSAGE);
    }
    return res.status(HttpStatus.OK).send(collection.collectionStatus);
  }

  @Patch('/collection/:collectionId/status')
  @UseGuards(RolesGuard([Role.ADMIN, Role.COLLECTION_OWNER]))
  @UseGuards(JwtAuthGuard)
  async updateCollectionStatus(
    @Param('collectionId') collectionId: string,
    @Query('queue') queue: boolean,
    @Body() body,
    @Res() res,
  ): Promise<string> {
    const { collectionStatus } = body;
    if (!Object.values(CollectionStatus).includes(collectionStatus)) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Collection status provided is not valid.');
    }

    const collection = await this.collectionService.findOne(collectionId);
    if (!collection) {
      return res.status(HttpStatus.NOT_FOUND).send(NOT_FOUND_MESSAGE);
    }

    let result: boolean;
    if (queue) {
      result = await this.collectionService.updateCollectionStatusViaQueue(
        collectionId,
        collectionStatus,
      );
    } else {
      result = await this.collectionService.updateCollectionStatus(
        collectionId,
        collectionStatus,
      );
    }
    if (result) {
      return res.status(HttpStatus.OK).send();
    }
    return res.status(HttpStatus.BAD_REQUEST).send();
  }

  @Post('/collection')
  @UseGuards(RolesGuard([Role.ADMIN, Role.COLLECTION_OWNER]))
  @UseGuards(JwtAuthGuard)
  async createCollection(
    @Body() body: CollectionDTO,
    @Res() res,
  ): Promise<string> {
    const { collectionName, collectionOwner } = body;

    const collectionId = await this.collectionService.create({
      collectionName,
      collectionOwner,
    });

    if (!collectionId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Could not create collection');
    }
    return res.status(HttpStatus.CREATED).send(collectionId);
  }

  @Post('/collection/:collectionId/generate-artwork')
  @UseGuards(RolesGuard([Role.ADMIN, Role.COLLECTION_OWNER]))
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    EnforceEmptyDirectoryInterceptor(path.join(__dirname, UPLOADED_LAYERS_DIR_NAME)),
    FilesInterceptor('images', null, {
      fileFilter: fileTypeResolver,
      storage: diskStorage({
        destination: createArtworkDestinationResolver,
        filename: createArtworkFilenameResolver,
      }),
    }),
  )
  async generateArtworkAndAddToCollection(
    @Param('collectionId') collectionId: string,
    @UploadedFiles() images: Array<Express.Multer.File>,
    @Body() body: { collectionSize: number },
    @Res() res,
  ): Promise<string> {
    const { collectionSize } = body;

    if (!collectionSize) {
      emptyDirSync(path.join(__dirname, UPLOADED_LAYERS_DIR_NAME));
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Please specify a collectionSize.');
    }
    if (images.length < 25) {
      emptyDirSync(path.join(__dirname, UPLOADED_LAYERS_DIR_NAME));
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          'Please provide at least 5 layers with at least 5 options for each layer',
        );
    }

    const collection = await this.collectionService.findOne(collectionId);
    if (!collection) {
      emptyDirSync(path.join(__dirname, UPLOADED_LAYERS_DIR_NAME));
      return res.status(HttpStatus.NOT_FOUND).send(NOT_FOUND_MESSAGE);
    }
    if (
      ![CollectionStatus.CREATED, CollectionStatus.PROCESSING].includes(
        collection.collectionStatus,
      )
    ) {
      emptyDirSync(path.join(__dirname, UPLOADED_LAYERS_DIR_NAME));
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Collection already processed.');
    }

    const result = await this.collectionService.generateArtwork(
      collectionId,
      collectionSize,
    );
    if (result) {
      return res.status(HttpStatus.OK).send();
    } else {
      emptyDirSync(path.join(__dirname, UPLOADED_LAYERS_DIR_NAME));
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
  }

  @Post('/collection/:collectionId/upload-artwork')
  @UseGuards(RolesGuard([Role.ADMIN, Role.COLLECTION_OWNER]))
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    EnforceEmptyDirectoryInterceptor(
      path.join(__dirname, UPLOADED_IMAGES_DIR_NAME),
    ),
    FilesInterceptor('images', null, {
      fileFilter: fileTypeResolver,
      storage: diskStorage({
        destination: path.join(__dirname, UPLOADED_IMAGES_DIR_NAME),
        filename: (req, file, callback) => callback(null, file.originalname),
      }),
    }),
  )
  async uploadArtworkAndAddToCollection(
    @Param('collectionId') collectionId: string,
    @UploadedFiles() images: Array<Express.Multer.File>,
    @Res() res,
  ): Promise<string> {
    const collection = await this.collectionService.findOne(collectionId);
    if (!collection) {
      emptyDirSync(path.join(__dirname, UPLOADED_IMAGES_DIR_NAME));
      return res.status(HttpStatus.NOT_FOUND).send(NOT_FOUND_MESSAGE);
    }
    if (
      ![CollectionStatus.CREATED, CollectionStatus.PROCESSING].includes(
        collection.collectionStatus,
      )
    ) {
      emptyDirSync(path.join(__dirname, UPLOADED_IMAGES_DIR_NAME));
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Collection already processed.');
    }

    const result = await this.collectionService.uploadArtwork(
      collectionId,
      images.length,
    );
    if (result) {
      return res.status(HttpStatus.OK).send();
    } else {
      emptyDirSync(path.join(__dirname, UPLOADED_IMAGES_DIR_NAME));
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
  }

  @Post('/collection/:collectionId/sync-to-ipfs')
  @UseGuards(RolesGuard([Role.ADMIN, Role.COLLECTION_OWNER]))
  @UseGuards(JwtAuthGuard)
  async syncCollectionWithIPFSIPFS(
    @Param('collectionId') collectionId: string,
    @Body() { numbersToRemove }: UploadToIpfsDTO,
    @Res() res,
  ) {
    const collection = await this.collectionService.findOne(collectionId);
    if (!collection) {
      return res.status(HttpStatus.NOT_FOUND).send(NOT_FOUND_MESSAGE);
    }
    if (collection.collectionStatus !== CollectionStatus.PROCESSED) {
      let statusMessage;
      switch (collection.collectionStatus) {
        case CollectionStatus.CREATED:
        case CollectionStatus.PROCESSING:
          statusMessage = 'Collection cannot be uploaded yet.';
          break;
        case CollectionStatus.UPLOADING:
          statusMessage = 'Collection being uploaded already.';
          break;
        case CollectionStatus.UPLOADED:
        case CollectionStatus.DEPLOYED:
          statusMessage = 'Collection already uploaded.';
          break;
      }
      return res.status(HttpStatus.BAD_REQUEST).send(statusMessage);
    }

    const result = await this.collectionService.syncFilesWithIPFS(
      collectionId,
      numbersToRemove,
    );
    if (result) {
      return res.status(HttpStatus.OK).send();
    } else {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
  }

  @Post('/collection/:collectionId/contract-address')
  @UseGuards(RolesGuard([Role.ADMIN, Role.COLLECTION_OWNER]))
  @UseGuards(JwtAuthGuard)
  async setContractAddress(
    @Param('collectionId') collectionId: string,
    @Body() body,
    @Res() res,
  ): Promise<string> {
    const { contractAddress } = body;
    if (!contractAddress) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Please provide contract address');
    }

    const collection = await this.collectionService.findOne(collectionId);
    if (!collection) {
      return res.status(HttpStatus.NOT_FOUND).send(NOT_FOUND_MESSAGE);
    }

    const result = await this.collectionService.setContractAddress(
      collectionId,
      contractAddress,
    );
    if (result) {
      return res.status(HttpStatus.OK).send();
    }
    return res.status(HttpStatus.BAD_REQUEST).send();
  }

  @Post('/collection/:collectionId/set-minting-page-gif')
  @UseGuards(RolesGuard([Role.ADMIN, Role.COLLECTION_OWNER]))
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('gif', {
      fileFilter: (req, file, callback) => {
        const acceptedImageTypes = ['image/gif'];
        if (!acceptedImageTypes.includes(file.mimetype)) {
          return callback(
            new UnsupportedMediaTypeException('Must be .gif'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async setMintingPageGif(
    @UploadedFile() gif: Express.Multer.File,
    @Param('collectionId') collectionId: string,
    @Res() res,
  ): Promise<any> {
    const collection = this.collectionService.findOne(collectionId);
    if (!collection) {
      return res.status(HttpStatus.NOT_FOUND).send(NOT_FOUND_MESSAGE);
    }

    const result = await this.collectionService.saveImageAgainstCollection(
      collectionId,
      gif,
      'gifDirectoryHash',
    );
    if (!result) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
    return res.status(HttpStatus.OK).send();
  }

  @Post('/collection/:collectionId/set-background-image')
  @UseGuards(RolesGuard([Role.ADMIN, Role.COLLECTION_OWNER]))
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('backgroundImage', {
      fileFilter: (req, file, callback) => {
        const acceptedImageTypes = ['image/png', 'image/jpeg'];
        if (!acceptedImageTypes.includes(file.mimetype)) {
          return callback(
            new UnsupportedMediaTypeException('Must be .png or .jpg or .jpeg'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async setMintingPageBackgroundImage(
    @UploadedFile() backgroundImage: Express.Multer.File,
    @Param('collectionId') collectionId: string,
    @Res() res,
  ): Promise<any> {
    const collection = this.collectionService.findOne(collectionId);
    if (!collection) {
      return res.status(HttpStatus.NOT_FOUND).send(NOT_FOUND_MESSAGE);
    }

    const result = await this.collectionService.saveImageAgainstCollection(
      collectionId,
      backgroundImage,
      'backgroundImageDirectoryHash',
    );
    if (!result) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
    return res.status(HttpStatus.OK).send();
  }

  @Post('/collection/:collectionId/set-website')
  @UseGuards(RolesGuard([Role.ADMIN, Role.COLLECTION_OWNER]))
  @UseGuards(JwtAuthGuard)
  async setMintingWebsiteLink(
    @Param('collectionId') collectionId: string,
    @Body() { website }: { website: string },
    @Res() res,
  ): Promise<any> {
    const collection = this.collectionService.findOne(collectionId);
    if (!collection) {
      return res.status(HttpStatus.NOT_FOUND).send(NOT_FOUND_MESSAGE);
    }
    const result = await this.collectionService.setCollectionWebsiteLink(
      collectionId,
      website,
    );
    if (!result) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
    return res.status(HttpStatus.OK).send();
  }
}

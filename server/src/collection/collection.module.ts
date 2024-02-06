import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AgendaModule } from '@sigmaott/nestjs-agenda';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { CollectionSchema } from './schemas/collection.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Collection', schema: CollectionSchema },
    ]),
    AgendaModule.forRootAsync(AgendaModule, {
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        db: {
          address: configService.get('MONGODB_CONNECTION_STRING'),
          collection: 'jobs-queue',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CollectionService],
  controllers: [CollectionController],
})
export class CollectionModule {}

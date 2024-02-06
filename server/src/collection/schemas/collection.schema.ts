import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CollectionStatus } from '../interfaces/collection.interface';

@Schema({ timestamps: true })
class Collection {
  @Prop()
  collectionId: string;
  @Prop()
  collectionName: string;
  @Prop()
  collectionOwner: string;
  @Prop()
  collectionSize: number;
  @Prop()
  collectionStatus: CollectionStatus;
  
  @Prop()
  contractAddress: string;
  @Prop()
  imagesDirectoryHash: string;
  @Prop()
  jsonFilesDirectoryHash: string;

  //Minting page gif
  @Prop()
  gifDirectoryHash: string;
  //Minting page background image
  @Prop()
  backgroundImageDirectoryHash: string;
  //Minting page website link
  @Prop()
  website: string;
}
export const CollectionSchema = SchemaFactory.createForClass(Collection);

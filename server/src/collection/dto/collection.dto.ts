import { IsEthereumAddress, IsNotEmpty } from "class-validator";

export class CollectionDTO {
    @IsNotEmpty()
    readonly collectionName: string;
    @IsEthereumAddress()
    readonly collectionOwner: string;
}
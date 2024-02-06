import { IsArray, IsEthereumAddress, IsNotEmpty } from "class-validator";

export class UploadToIpfsDTO {
    @IsArray()
    readonly numbersToRemove: number[];
}
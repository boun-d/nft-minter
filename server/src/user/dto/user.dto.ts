import { IsEthereumAddress, IsNotEmpty } from 'class-validator';
import { Role } from 'src/auth/role/role.enum';

export class UserDTO {
  @IsNotEmpty()
  readonly walletOwner: string;
  @IsEthereumAddress()
  readonly publicAddress: string;
  @IsNotEmpty()
  readonly role: Role;
}

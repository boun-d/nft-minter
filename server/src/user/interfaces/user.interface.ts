import { Document } from 'mongoose';
import { Role } from 'src/auth/role/role.enum';

export interface User extends Document {
    readonly walletOwner: string;
    readonly publicAddress: string;
    readonly nonce: string;
    readonly role: Role;
}
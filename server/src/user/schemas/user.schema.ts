import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from 'src/auth/role/role.enum';

@Schema()
class User {
  @Prop()
  walletOwner: string;
  @Prop()
  publicAddress: string;
  @Prop()
  nonce: string;
  @Prop()
  role: Role;
}
export const UserSchema = SchemaFactory.createForClass(User);

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { bufferToHex, ecrecover, fromRpcSig, keccak, pubToAddress, toBuffer } from 'ethereumjs-util';
import { User } from 'src/user/interfaces/user.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(publicAddress: string, signature: string): Promise<User> {
    const user = await this.userService.findOne(publicAddress);

    if (!user) {
        return null;
    }

    const message = 'Please sign this one-time nonce to log in: ' + user.nonce;
    const messageWithPrefix = '\x19Ethereum Signed Message:\n' + message.length + message; 

    const hash = keccak(Buffer.from(messageWithPrefix, 'utf-8'));
    const { v, r, s } = fromRpcSig(signature);
    
    const publicKey = ecrecover(toBuffer(hash), v, r, s);
    const signingAddressBuffer = pubToAddress(publicKey);
    const signingAddress = bufferToHex(signingAddressBuffer);

    if (user.publicAddress.toLowerCase() === signingAddress.toLowerCase()) {
        return user;
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      walletOwner: user.walletOwner,
      publicAddress: user.publicAddress,
      role: user.role
    };
    await this.userService.resetNonce(user.publicAddress);
    return this.jwtService.sign(payload);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { keccak256, intToBuffer, bufferToHex } from 'ethereumjs-util';
import { Model } from 'mongoose';
import { Role } from 'src/auth/role/role.enum';

import { UserDTO } from './dto/user.dto';
import { User } from './interfaces/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-__v -_id');
  }
  async findOne(publicAddress: string): Promise<User | undefined> {
    return this.userModel.findOne({ publicAddress }).select('-__v -_id');
  }
  async add(user: UserDTO): Promise<User> {
    const nonce = this.generateRandomNonce();
    const newUser = new this.userModel({
      ...user,
      nonce,
      publicAddress: user.publicAddress.toLowerCase(),
    });
    return newUser.save();
  }
  async updateRole(publicAddress: string, role: Role): Promise<boolean> {
    const result = await this.userModel
      .findOneAndUpdate(
        {
          publicAddress,
        },
        { role },
      )
      .exec();
    return !!result;
  }
  async remove(publicAddress: string): Promise<boolean> {
    const result = await this.userModel.findOneAndDelete({
      publicAddress,
    });
    return !!result;
  }
  async resetNonce(publicAddress: string): Promise<User> {
    const newNonce = this.generateRandomNonce();
    return await this.userModel.findOneAndUpdate(
      { publicAddress },
      { nonce: newNonce },
    );
  }
  generateRandomNonce(): string {
    const randomNumber = Math.floor(Math.random() * 1000000);
    const hash = keccak256(intToBuffer(randomNumber));
    return bufferToHex(hash).substring(2);
  }
}

import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import {
  bufferToHex,
  ecrecover,
  fromRpcSig,
  keccak,
  pubToAddress,
  toBuffer,
} from 'ethereumjs-util';

jest.mock('ethereumjs-util', () => ({
  ...jest.requireActual('ethereumjs-util'),
  keccak: jest.fn(),
  fromRpcSig: jest.fn(),
  ecrecover: jest.fn(),
  pubToAddress: jest.fn(),
  bufferToHex: jest.fn(),
  toBuffer: jest.fn(),
}));

const mockKeccak = keccak as jest.Mock;
const mockFromRPCSig = fromRpcSig as jest.Mock;
const mockEcrecover = ecrecover as jest.Mock;
const mockToBuffer = toBuffer as jest.Mock;
const mockPubToAddress = pubToAddress as jest.Mock;
const mockBufferHex = bufferToHex as jest.Mock;

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        JwtService,
        {
          provide: getModelToken('User'),
          useValue: {},
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return null if user cannot be found', async () => {
      jest
        .spyOn(userService, 'findOne')
        .mockImplementationOnce(() => undefined);

      const result = await authService.validateUser(
        'publicAddress',
        'signature',
      );

      expect(result).toEqual(null);
    });
    it('should return user if signingAddress is the same as the provided one', async () => {
      const publicAddress = '0xaaaa';
      const signature = '0xbbbb';

      const user = { publicAddress };
      const data: any = new Promise((resolve) => resolve(user));
      jest.spyOn(userService, 'findOne').mockImplementationOnce(() => data);
      mockKeccak.mockImplementationOnce(() => 'hash');
      mockFromRPCSig.mockImplementationOnce(() => ({ v: 'v', r: 'r', s: 's' }));
      mockEcrecover.mockImplementationOnce(() => 'publicKey');
      mockToBuffer.mockImplementationOnce(() => 'buffer');
      mockPubToAddress.mockImplementationOnce(() => 'signingAddressBuffer');
      mockBufferHex.mockImplementationOnce(() => publicAddress);

      const result = await authService.validateUser(publicAddress, signature);

      expect(result).toEqual(user);
    });
    it('should return null if signingAddress is NOT the same as the provided one', async () => {
      const publicAddress = '0xaaaa';
      const signature = '0xbbbb';

      const user = { publicAddress };
      const data: any = new Promise((resolve) => resolve(user));
      jest.spyOn(userService, 'findOne').mockImplementationOnce(() => data);
      mockKeccak.mockImplementationOnce(() => 'hash');
      mockFromRPCSig.mockImplementationOnce(() => ({ v: 'v', r: 'r', s: 's' }));
      mockEcrecover.mockImplementationOnce(() => 'publicKey');
      mockToBuffer.mockImplementationOnce(() => 'buffer');
      mockPubToAddress.mockImplementationOnce(() => 'signingAddressBuffer');
      mockBufferHex.mockImplementationOnce(() => 'not' + publicAddress);

      const result = await authService.validateUser(publicAddress, signature);

      expect(result).toEqual(null);
    });
  });
});

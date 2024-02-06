import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/user/user.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('getToken', () => {
    it('should return OK if login returns string', async () => {
      const data: any = new Promise((resolve) =>
        resolve({ nonce: 'random_nonce' }),
      );
      jest
        .spyOn(authService, 'login')
        .mockImplementationOnce(async () => 'sample_jwt_token');

      const mockReq = {};
      const result = await authController.getToken(mockReq);

      expect(result).toEqual('sample_jwt_token');
    });
  });
});

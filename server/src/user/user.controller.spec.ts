import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from 'src/auth/role/role.enum';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const stubUsers = () => [
  {
    walletOwner: 'ADMIN',
    publicAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    nonce: 'abcdefg',
    role: Role.ADMIN,
  },
  {
    walletOwner: 'COLLECTION_OWNER',
    publicAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    nonce: 'zyxwvut',
    role: Role.COLLECTION_OWNER,
  },
];

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const mockResponseObject = () => {
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
      send: jest.fn(),
    };
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getModelToken('User'),
          useValue: {},
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('getUserNonce', () => {
    it('should return OK and the users nonce if service finds user', async () => {
      const data: any = new Promise((resolve) =>
        resolve({ nonce: 'random_nonce' }),
      );
      jest.spyOn(userService, 'findOne').mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await userController.getUserNonce('publicAddress', res);

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ nonce: 'random_nonce' });
    });
    it('should return NOT_FOUND if service cannot find user', async () => {
      const data: any = new Promise((resolve) => resolve(undefined));
      jest.spyOn(userService, 'findOne').mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await userController.getUserNonce('publicAddress', res);

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
  describe('getUsers', () => {
    it('should array of all users', async () => {
      const users = stubUsers();
      const data: any = new Promise((resolve) => resolve(users));
      jest.spyOn(userService, 'findAll').mockImplementationOnce(() => data);

      const result = await userController.getUsers();

      expect(result).toEqual(users);
    });
  });
  describe('getUser', () => {
    it('should return OK and the user if service finds user', async () => {
      const user = stubUsers()[0];
      const data: any = new Promise((resolve) => resolve(user));
      jest.spyOn(userService, 'findOne').mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await userController.getUser('publicAddress', res);

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });
    it('should return NOT_FOUND if service cannot find user', async () => {
      const data: any = new Promise((resolve) => resolve(undefined));
      jest.spyOn(userService, 'findOne').mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await userController.getUser('publicAddress', res);

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
  describe('deleteUser', () => {
    it('should return OK if the user is removed successfully', async () => {
      const user = stubUsers()[0];
      const data: any = new Promise((resolve) => resolve(user));
      jest.spyOn(userService, 'findOne').mockImplementationOnce(() => data);
      jest
        .spyOn(userService, 'remove')
        .mockImplementationOnce(() => new Promise((resolve) => resolve(true)));

      const res = mockResponseObject();
      const result = await userController.deleteUser('publicAddress', res);

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    it('should return BAD_REQUEST if the user is NOT removed successfully', async () => {
      const user = stubUsers()[0];
      const data: any = new Promise((resolve) => resolve(user));
      jest.spyOn(userService, 'findOne').mockImplementationOnce(() => data);
      jest
        .spyOn(userService, 'remove')
        .mockImplementationOnce(() => new Promise((resolve) => resolve(false)));

      const res = mockResponseObject();
      const result = await userController.deleteUser('publicAddress', res);

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
  describe('updateRole', () => {
    it('should return OK if the role is updated successfully', async () => {
      const user = stubUsers()[0];
      const data: any = new Promise((resolve) => resolve(user));
      jest.spyOn(userService, 'findOne').mockImplementationOnce(() => data);
      jest
        .spyOn(userService, 'updateRole')
        .mockImplementationOnce(() => new Promise((resolve) => resolve(true)));

      const res = mockResponseObject();
      const result = await userController.updateRole(
        'publicAddress',
        Role.ADMIN,
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    it('should return BAD_REQUEST if the role is NOT valid', async () => {
      const user = stubUsers()[0];
      const data: any = new Promise((resolve) => resolve(user));
      jest.spyOn(userService, 'findOne').mockImplementationOnce(() => data);

      const res = mockResponseObject();
      const result = await userController.updateRole(
        'publicAddress',
        '' as any,
        res,
      );

      expect(result).toEqual(undefined);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

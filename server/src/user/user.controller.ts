import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'src/auth/role/role.enum';
import { RolesGuard } from 'src/auth/role/roles.guard';
import { UserDTO } from './dto/user.dto';
import { User } from './interfaces/user.interface';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/user/:publicAddress/nonce')
  async getUserNonce(
    @Param('publicAddress') publicAddress: string,
    @Res() res,
  ): Promise<User> {
    const user = await this.userService.findOne(publicAddress);
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).send();
    }
    return res.status(HttpStatus.OK).json({ nonce: user.nonce })
  }

  @Get('/users')
  @UseGuards(RolesGuard([Role.ADMIN, Role.COLLECTION_OWNER]))
  @UseGuards(JwtAuthGuard)
  async getUsers(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Get('/user/:publicAddress')
  @UseGuards(RolesGuard([Role.ADMIN, Role.COLLECTION_OWNER]))
  @UseGuards(JwtAuthGuard)
  async getUser(
    @Param('publicAddress') publicAddress: string,
    @Res() res,
  ): Promise<User> {
    const user = await this.userService.findOne(publicAddress);
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).send();
    }
    return res.status(HttpStatus.OK).json(user)
  }

  @Post('/user')
  // @UseGuards(RolesGuard([Role.ADMIN]))
  // @UseGuards(JwtAuthGuard)
  async addUser(@Body() userDTO: UserDTO, @Res() res) {
    const isValidRole = Object.values(Role).includes(userDTO.role);
    if (!isValidRole) {
      return res.status(HttpStatus.BAD_REQUEST).send('Invalid role.');
    }

    const result = await this.userService.add(userDTO);
    if (!result) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
    return res.status(HttpStatus.CREATED).send();
  }

  @Delete('/user/:publicAddress')
  @UseGuards(RolesGuard([Role.ADMIN]))
  @UseGuards(JwtAuthGuard)
  async deleteUser(
    @Param('publicAddress') publicAddress: string,
    @Res() res,
  ): Promise<boolean> {
    const user = await this.userService.findOne(publicAddress);
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).send();
    }

    const result = await this.userService.remove(publicAddress);
    if (!result) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
    return res.status(HttpStatus.OK).send();
  }

  @Patch('/user/:publicAddress/role')
  async updateRole(
    @Param('publicAddress') publicAddress: string,
    @Query('role') role: Role,
    @Res() res,
  ) {
    const user = await this.userService.findOne(publicAddress);
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).send();
    }

    if (!role) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Please provide a role to update to.');
    }

    const isValidRole = Object.values(Role).includes(role);
    if (!isValidRole) {
      return res.status(HttpStatus.BAD_REQUEST).send('Invalid role.');
    }

    const result = await this.userService.updateRole(publicAddress, role);
    if (!result) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
    return res.status(HttpStatus.OK).send();
  }
}

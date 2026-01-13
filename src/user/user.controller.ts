import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import type { IUserResponse } from './types/userResponse.interface';
import { LoginDto } from './dto/loginUser.dto';
import type { AuthRequest } from '@/types/expressRequest.interface';
import { User } from './decorator/user.decorator';
import { AuthGuard } from './guards/auth.guard';
import { updateUserDto } from './dto/updateUser.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UsePipes(new ValidationPipe())
  async createUser(@Body('user') createUserDto: CreateUserDto): Promise<any> {
    return await this.userService.createUser(createUserDto);
  }

  @Post('users/login')
  @UsePipes(new ValidationPipe())
  async loginUser(
    @Body('user') loginUserDto: LoginDto,
  ): Promise<IUserResponse> {
    const user = await this.userService.loginUser(loginUserDto);
    return this.userService.generateUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  async updateUser(
    @User('id') userId: number,
    @Body('user') updateUserDto: updateUserDto,
  ): Promise<IUserResponse> {
    const updateUser = await this.userService.updateUser(userId, updateUserDto);
    return this.userService.generateUserResponse(updateUser);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  getCurrentUser(@User() user): IUserResponse {
    if (!user) {
      throw new UnauthorizedException(
        'Authentication token is missing or invalid',
      );
    }

    return this.userService.generateUserResponse(user);
  }
}

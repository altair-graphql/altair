import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      id: 1,
      username: 'imolorhe',
      email: 'imolorhe@altair.io',
      password: 'pass',
    },
  ];

  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto) {
    if (!createUserDto) {
      throw new Error('No user data provided!');
    }
    const createdUser = new this.UserModel(createUserDto);

    return createdUser.save();
  }

  async findOne(username: string) {
    return this.users.find((u) => u.username === username);
  }

  async findAll() {
    return this.UserModel.find().exec();
  }
}

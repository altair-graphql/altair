import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto) {
    if (!createUserDto) {
      throw new Error('No user data provided!');
    }
    const createdUser = new this.UserModel(createUserDto);

    return createdUser.save();
  }

  async findOne(email: string) {
    return this.UserModel.findOne({ email }).exec();
  }

  async findAll() {
    return this.UserModel.find().exec();
  }
}

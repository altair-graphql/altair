import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestUser } from 'src/auth/types';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    private workspacesService: WorkspacesService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (!createUserDto) {
      throw new Error('No user data provided!');
    }
    const createdUser = new this.UserModel(createUserDto);

    return createdUser.save();
  }

  async findOne(id: string) {
    return this.UserModel.findById(id).populate('privateWorkspace').exec();
  }

  async findByEmail(email: string) {
    return this.UserModel.findOne({ email }).exec();
  }

  async findOrCreateUserByRequestUser(reqUser: RequestUser) {
    const user = await this.findByEmail(reqUser.email);
    if (!user) {
      return this.createUser(reqUser);
    }

    return user;
  }

  async findAll() {
    return this.UserModel.find().exec();
  }

  async createUser(reqUser: RequestUser) {
    const user = await this.UserModel.create({
      email: reqUser.email,
      auth0Id: reqUser.auth0Id,
      firstName: reqUser.firstName || reqUser.name,
      lastName: reqUser.lastName,
    });

    // Perform other tasks (e.g. create user default workspace)
    const ws = await this.workspacesService.create({
      name: `My first workspace`,
      owner: user.id,
    });

    // add workspace to user
    await user.update({ privateWorkspace: ws.id }).exec();

    return user;
  }
}

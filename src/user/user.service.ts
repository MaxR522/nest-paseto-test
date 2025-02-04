import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Check an user with email or username already exists
    const existUser = await this.userRepository
      .createQueryBuilder('user')
      .where('email = :email', { email: createUserDto.email })
      .orWhere('username = :username', { username: createUserDto.username })
      .getOne();

    if (existUser) {
      return new BadRequestException(
        'User with this email or username already exists',
      );
    }

    const user = await this.userRepository.save(createUserDto);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitizedUser } = user;

    return {
      message: 'User created successfully',
      data: sanitizedUser,
    };
  }

  async findAll() {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .getMany();

    return users;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOneById(id);

    const editedUser = Object.assign(user, updateUserDto);
    return await this.userRepository.save(editedUser);
  }

  async remove(id: number) {
    return await this.userRepository
      .createQueryBuilder()
      .softDelete()
      .where('id = :id', { id })
      .execute();
  }

  async findOneById(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      return new NotFoundException('User not found');
    }

    return user;
  }
}

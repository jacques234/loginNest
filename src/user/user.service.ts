import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createUserDto: CreateUserDto,UserReq:UserReq) {
  const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

  try {
    return await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        userCreated: UserReq.username,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictException('Email already exists');
    }

    console.error('Unexpected error creating user:', error);
    throw new InternalServerErrorException('Error creating user');
  }
}

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id
      }
    })
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: {
        id
      },
      data: updateUserDto
    })
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}

//users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateUserDto } from './dto/createUserDto.js';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/updateUserDto.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(body: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(body.password, 10);
    return this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        passwordHash: hashedPassword,
      },
    });
  }

  async getAllUsers() {
    return await this.prisma.user.findMany();
  }

  async updateUser(userId: number, body: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: body,
    });
  }

  async getUserById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }

    return await this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async deleteUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }

    return await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async findOne(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    return user;
  }
}

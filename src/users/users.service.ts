import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/createUserDto';


@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async createUser(user: CreateUserDto) {
        return this.prisma.user.create({
            data: user,
        });
    }
}

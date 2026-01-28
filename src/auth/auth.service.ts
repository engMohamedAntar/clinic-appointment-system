import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/registerDto.js';
import { PrismaService } from '../prisma.service.js';
import { UserRole } from '../generated/prisma/browser.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  async generateTokens(user) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
      expiresIn: '3600s',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(user) {
    const { accessToken, refreshToken } = await this.generateTokens(user);
    return {
      id: user.id,
      accessToken,
      refreshToken,
    };
  }

  async register(body: RegisterDto) {
    // check if user with email already exists
    const existingUser = await this.usersService.findOne(body.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // compare password and confirmPassword
    if (body.password !== body.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    // create new user
    const newUser = await this.prismaService.user.create({
      data: {
        name: body.name,
        email: body.email,
        role: UserRole.PATIENT,
        passwordHash: await bcrypt.hash(body.password, 10),
      },
    });

    // generate jwt and refresh-jwt tokens.
    const { accessToken, refreshToken } = await this.generateTokens(newUser);

    // return user, jwt and refresh-jwt tokens.
    return {
      user: newUser,
      accessToken,
      refreshToken,
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);

    if (!user) throw new NotFoundException('User not found');
    //comparer pass with user.password
    const compareRes = await bcrypt.compare(pass, user.passwordHash);
    //continue here
    if (compareRes) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }
}

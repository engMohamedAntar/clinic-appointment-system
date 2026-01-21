//createUserDto.ts
import { IsEmail, IsString, Length, IsEnum } from 'class-validator';
import { UserRole } from '../users.constants';

export class CreateUserDto {
  @IsString({message: 'name must be a string'})
  @Length(3, 40, {message: 'name must be between 3 and 50 characters'})
  name: string;

  @IsEmail({}, { message: 'email not valid' })
  email: string;

  @IsString({ message: 'password must be a string' })
  @Length(6, 20, { message: 'password must be between 6 and 20 characters' })
  password: string;

  @IsEnum(UserRole, { message: 'role must be a valid role' })
  role: UserRole;
}
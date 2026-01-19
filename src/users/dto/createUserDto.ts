import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;
  @IsEmail({}, { message: 'email not valid' })
  email: string;
}
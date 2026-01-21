//createUserDto.ts
import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { UserRole } from '../users.constants';


export class UpdateUserDto {
  @IsOptional()
  @IsString({message: 'name must be a string'})
  @Length(3, 40, {message: 'name must be between 3 and 50 characters'})
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'email not valid' })
  email?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'role must be either PATIENT, DOCTOR or ADMIN' })  
  role?: UserRole;
}
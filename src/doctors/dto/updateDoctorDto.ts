import {IsOptional, IsString } from 'class-validator';

export class UpdateDoctorDto {
  @IsOptional()
  @IsString({ message: 'fullName must be a string' })
  fullName: string;

  @IsOptional()
  @IsString({ message: 'speciality must be a string' })
  speciality: string;

  @IsOptional()
  @IsString({ message: 'bio must be a string' })
  bio: string;

  @IsOptional()
  @IsString({ message: 'phone must be a string' })
  phone: string;

  @IsOptional()
  @IsString({ message: 'room must be a string' })
  room: string;
}

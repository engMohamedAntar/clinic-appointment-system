import {IsNumber, IsString } from 'class-validator';

export class CreateDoctorDto {
  @IsNumber()
  userId : number;

  @IsString({ message: 'fullName must be a string' })
  fullName: string;

  @IsString({ message: 'speciality must be a string' })
  specialty: string;

  @IsString({ message: 'bio must be a string' })
  bio: string;

  @IsString({ message: 'phone must be a string' })
  phone: string;

  @IsString({ message: 'room must be a string' })
  room: string;
}

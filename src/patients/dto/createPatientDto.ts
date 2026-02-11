import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePatientDto {
  @IsOptional()
  @IsNumber()
  userId ?: number;

  @IsString({ message: 'fullName must be a string' })
  fullName: string;

  @IsDate({ message: 'dateOfBirth must be a valid date' })
  dateOfBirth: Date;

  @IsString({ message: 'phone must be a string' })
  phone: string;

  @IsString({ message: 'address must be a string' })
  address: string;

  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  notes?: string;
}

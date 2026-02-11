import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePatientDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsString({ message: 'fullName must be a string' })
  fullName?: string;

  @IsOptional()
  @IsDate({ message: 'dateOfBirth must be a valid date' })
  dateOfBirth?: Date;

  @IsOptional()
  @IsString({ message: 'phone must be a string' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'address must be a string' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  notes?: string;
}

// create-appointment.dto.ts
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  doctorId: number;

  @IsDateString()
  startTime: string; 

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
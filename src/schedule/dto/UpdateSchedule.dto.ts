import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateScheduleDto {
  @IsOptional()
  @IsNumber()
  doctorId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'dayOfWeek must be a number' })
  dayOfWeek?: number;

  @IsOptional()
  @IsString({ message: 'startTime must be a string' })
  startTime?: string;

  @IsOptional()
  @IsString({ message: 'endTime must be a string' })
  endTime?: string;

  @IsOptional()
  @IsNumber({}, { message: 'slotDurationMinutes must be a number' })
  slotDurationMinutes?: number;
}

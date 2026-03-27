import { IsNumber, IsString } from 'class-validator';

export class CreateScheduleDto {
  @IsNumber()
  doctorId : number; 

  @IsNumber({}, { message: 'dayOfWeek must be a number' })
  dayOfWeek: number;

  @IsString({ message: 'startTime must be a string' })
  startTime: string;

  @IsString({ message: 'endTime must be a string' })
  endTime: string;

  @IsNumber({},{ message: 'slotDurationMinutes must be a number' })
  slotDurationMinutes: number;
}

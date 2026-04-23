import { IsEnum, IsString } from 'class-validator';

export class UpdateAppointmentStatusDto {
  @IsString()
  @IsEnum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'], {
    message:
      'Status must be one of the following: PENDING, CONFIRMED, CANCELLED, COMPLETED',
  })
  status: string;
}

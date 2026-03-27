import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateScheduleDto } from './dto/createSchedule.dto.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class ScheduleService {
  constructor(private prismaService: PrismaService) {}

  async createSchedule(user, body: CreateScheduleDto) {
    //if user.role is DOCTOR check that body.doctorId = user.id
    if (user.role === 'DOCTOR') {
      const loggedInDoctor = await this.prismaService.doctor.findUnique({
        where: { userId: user.id },
      });

      if (!loggedInDoctor)
        throw new NotFoundException(
          `No doctor found for user id ${body.doctorId}`,
        );

      if (body.doctorId !== loggedInDoctor.id)
        throw new ForbiddenException(
          'You can only create schedules for yourself',
        );
    }

    return await this.prismaService.schedule.create({
      data: body,
    });
  }
}

import {
  ConflictException,
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
    // 1. If DOCTOR, verify they own this record
    if (user.role === 'DOCTOR') {
      const loggedInDoctor = await this.prismaService.doctor.findUnique({
        where: { userId: user.id },
      });

      if (!loggedInDoctor || body.doctorId !== loggedInDoctor.id)
        throw new ForbiddenException(
          'You can only create schedules for yourself',
        );
    }

    // 2. If ADMIN, at least check if the doctor exists
    if (user.role === 'ADMIN') {
      const doctorExists = await this.prismaService.doctor.findUnique({
        where: { id: body.doctorId },
      });
      if (!doctorExists) throw new NotFoundException('Doctor not found');
    }

    // 3. Attempt creation and handle the "Unique Constraint" (Duplicate Day)
    try {
      return await this.prismaService.schedule.create({
        data: body,
      });
    } catch (error) {
      // Prisma error code for unique constraint violation
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A schedule already exists for this doctor on this day',
        );
      }
      throw error;
    }
  }
}

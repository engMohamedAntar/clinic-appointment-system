import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateScheduleDto } from './dto/createSchedule.dto.js';
import { PrismaService } from '../prisma.service.js';
import { UpdateScheduleDto } from './dto/UpdateSchedule.dto.js';

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

  async getDoctorSchedules(doctorId: number) {
    const doctor = await this.prismaService.doctor.findFirst({
      where: { id: doctorId },
    });
    if (!doctor)
      throw new NotFoundException(`No doctor found for id ${doctorId}`);

    return await this.prismaService.schedule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async updateSchedule(scheduleId: number, user, body: UpdateScheduleDto) {
    // 1. Prepare the search filter
    const whereFilter: any = { id: scheduleId };

    // 2. If DOCTOR, they must also own the doctorId linked to this schedule
    if (user.role === 'DOCTOR') {
      const doctor = await this.prismaService.doctor.findUnique({
        where: { userId: user.id },
      });
      if (!doctor)
        throw new NotFoundException(
          `No doctor account found for userId ${user.id}`,
        );
      whereFilter.doctorId = doctor.id;
    }

    // 3. Perform the update
    try {
      return await this.prismaService.schedule.update({
        where: whereFilter,
        data: body,
      });
    } catch (error) {
      // P2025: Record to update not found (or doctorId didn't match)
      if (error.code === 'P2025')
        throw new ForbiddenException('Schedule not found or access denied');
      // P2002: Unique constraint failed (Doctor already has a schedule on this day)
      if (error.code === 'P2002')
        throw new ConflictException(
          'A schedule already exists for this day of the week',
        );

      throw error;
    }
  }
}

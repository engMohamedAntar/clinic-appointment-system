// appointment.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateAppointmentDto } from './dto/createAppointment.dto.js';
import { PrismaApiFeatures } from '../common/utils/PrismaApiFeatures.js';

const MAX_ADVANCE_DAYS = 30;

@Injectable()
export class AppointmentService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAppointment(dto: CreateAppointmentDto, patientId: number) {
    // ── 0. Parse dates safely (expect ISO with timezone!) ───────────────────
    const appointmentStart = new Date(dto.startTime);
    const appointmentEnd = new Date(dto.endTime);
    const now = new Date();

    // ── 1. Basic time sanity checks ────────────────────────────────────────
    if (isNaN(appointmentStart.getTime()) || isNaN(appointmentEnd.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (appointmentStart >= appointmentEnd) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (appointmentStart < now) {
      throw new BadRequestException('Cannot book an appointment in the past');
    }

    // ── 2. Max advance booking ─────────────────────────────────────────────
    const maxAdvanceDate = new Date(now);
    maxAdvanceDate.setDate(now.getDate() + MAX_ADVANCE_DAYS);
    // setDateSet(X)=> Sets the day of the month to X, and automatically adjust the month/year if needed.
    // getDate() returns the day

    if (appointmentStart > maxAdvanceDate) {
      throw new BadRequestException(
        `Cannot book more than ${MAX_ADVANCE_DAYS} days in advance`,
      );
    }

    // ── 3. Doctor existence check ──────────────────────────────────────────
    const doctor = await this.prismaService.doctor.findUnique({
      where: { id: dto.doctorId },
      include: { schedules: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!doctor.isActive) {
      throw new BadRequestException(
        'Doctor is not currently accepting appointments',
      );
    }

    // ── 4. Check doctor schedule for that day (UTC-safe) ───────────────────
    const dayOfWeek = appointmentStart.getUTCDay(); // 0 = Sunday
    const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Monday = 1

    const schedule = doctor.schedules.find(
      (s) => s.dayOfWeek === normalizedDay,
    );

    if (!schedule) {
      throw new BadRequestException(
        'Doctor does not have a schedule on the selected day',
      );
    }

    // ── 5. Convert times to minutes (UTC-based) ────────────────────────────
    const toMinutes = (time: string): number => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const startMinutes =
      appointmentStart.getUTCHours() * 60 + appointmentStart.getUTCMinutes();

    const endMinutes =
      appointmentEnd.getUTCHours() * 60 + appointmentEnd.getUTCMinutes();

    const scheduleStart = toMinutes(schedule.startTime);
    const scheduleEnd = toMinutes(schedule.endTime);

    // ── 6. Check within working hours ──────────────────────────────────────
    if (startMinutes < scheduleStart || endMinutes > scheduleEnd) {
      throw new BadRequestException(
        'Appointment is outside doctor working hours',
      );
    }

    // ── 7. Validate slot duration ──────────────────────────────────────────
    const duration =
      (appointmentEnd.getTime() - appointmentStart.getTime()) / 60000; // getTime() returns milliseconds

    if (duration !== schedule.slotDurationMinutes) {
      throw new BadRequestException(
        `Appointment must be exactly ${schedule.slotDurationMinutes} minutes`,
      );
    }

    // ── 8. Validate slot alignment (VERY IMPORTANT) ─────────────────────────
    if ((startMinutes - scheduleStart) % schedule.slotDurationMinutes !== 0) {
      throw new BadRequestException('Invalid slot alignment');
    }

    // ── 9. Transaction (prevents race condition) ───────────────────────────
    return this.prismaService.$transaction(async (tx) => {
      const overlapping = await tx.appointment.findFirst({
        where: {
          doctorId: dto.doctorId,
          status: {
            notIn: ['CANCELLED'],
          },
          startTime: { lt: appointmentEnd },
          endTime: { gt: appointmentStart },
        },
      });

      if (overlapping) {
        throw new BadRequestException('This time slot is already booked');
      }

      // ── 10. Create appointment ──────────────────────────────────────────
      return tx.appointment.create({
        data: {
          patientId,
          doctorId: dto.doctorId,
          startTime: appointmentStart,
          endTime: appointmentEnd,
          status: 'PENDING',
          reason: dto.reason ?? null,
          notes: dto.notes ?? null,
        },
      });
    });
  }

  async getMyAppointments(query: any, patientId: number) {
    const apiFeature = new PrismaApiFeatures(query, ['reason', 'notes']);

    const options = apiFeature.buildOptions();

    options.where = {
      ...options.where,
      patientId,
      status: { not: 'CANCELLED' },
    };

    const total = await this.prismaService.appointment.count({
      where: options.where,
    });

    const appointments = await this.prismaService.appointment.findMany(options);

    const paginationInfo = apiFeature.getPaginationInfo(
      total,
      appointments.length,
    );

    return {
      paginationInfo,
      appointments,
    };
  }

  async cancelAppointment(id: number, patientId: number) {
    const appointment = await this.prismaService.appointment.findUnique({
      where: { id },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.patientId !== patientId) 
      throw new ForbiddenException(
        'You are not allowed to cancel this appointment',
      );

    // Can't cancel if already cancelled or completed
    if (appointment.status === 'CANCELLED') 
      throw new BadRequestException('This appointment is already cancelled');
    if (appointment.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed appointment');
    }

    // Can't cancel past appointments
    const now = new Date();
    if (appointment.startTime <= now) {
      throw new BadRequestException(
        'Cannot cancel past or ongoing appointments',
      );
    }

    // Must cancel at least 2 hours before appointment
    const CANCEL_WINDOW_HOURS = 2;
    const diffInHours =
      (appointment.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < CANCEL_WINDOW_HOURS) {
      throw new BadRequestException(
        `Cannot cancel less than ${CANCEL_WINDOW_HOURS} hours before appointment`,
      );
    }

    return this.prismaService.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async getMyDoctorAppointments(query: any, userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {doctor: true},
    });
    if (!user || !user.doctor) {
      throw new NotFoundException('Doctor profile not found for this user');
    }
    
    const apiFeature = new PrismaApiFeatures(query, ['reason', 'notes']);

    const options = apiFeature.buildOptions();

    options.where = {
      ...options.where,
        doctorId: user.doctor.id,
      status: { not: 'CANCELLED' },
    };

    const total = await this.prismaService.appointment.count({
      where: options.where,
    });

    const appointments = await this.prismaService.appointment.findMany(options);
    const paginationInfo = apiFeature.getPaginationInfo(
      total,
      appointments.length,
    );

    return {
      paginationInfo,
      appointments,
    };
  }

}

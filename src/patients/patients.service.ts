import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreatePatientDto } from './dto/createPatientDto.js';
import { UpdatePatientDto } from './dto/updatePatientDto.js';

//patients.service.ts
@Injectable()
export class PatientsService {
  constructor(private prismaService: PrismaService) {}

  async createPatient(body: CreatePatientDto, req) {
    let userId = body.userId;

    // If patient role → force own ID
    if (req.user.role === 'PATIENT') {
      userId = req.user.id;
    }

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    // 1️⃣ Check user exists
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2️⃣ Ensure role is PATIENT
    if (user.role !== 'PATIENT') {
      throw new BadRequestException('User must have PATIENT role');
    }

    // 3️⃣ Prevent duplicate profile
    const existing = await this.prismaService.patient.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('Patient profile already exists');
    }

    return await this.prismaService.patient.create({
      data: {
        ...body,
        userId,
      },
    });
  }

  async updatePatient(body: UpdatePatientDto, req, id: number) {
    //Get the patient by id
    const patient = await this.prismaService.patient.findUnique({
      where: { id },
    });
    if (!patient) {
      throw new NotFoundException(`No patient found for id ${id}`);
    }

    //Check if the patient is allowed to update the profile
    if (req.user.role === 'PATIENT' && patient.userId !== req.user.id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, ...data } = body;
    return await this.prismaService.patient.update({
      where: { id },
      data: data,
    });
  }
}

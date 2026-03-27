import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateDoctorDto } from './dto/createDoctorDto.js';
import { UpdateDoctorDto } from './dto/updateDoctorDto.js';
import { PrismaApiFeatures } from '../common/utils/PrismaApiFeatures.js';

//Doctors.service.ts
@Injectable()
export class DoctorsService {
  constructor(private prismaService: PrismaService) {}

  async createDoctor(body: CreateDoctorDto) {
    // 1️⃣ Check user exists
    const user = await this.prismaService.user.findUnique({
      where: { id: body.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2️⃣ Ensure user role is DOCTOR
    if (user.role !== 'DOCTOR') {
      throw new BadRequestException('User is not a doctor');
    }

    // 3️⃣ Prevent duplicate profile
    const existing = await this.prismaService.doctor.findUnique({
      where: { userId: body.userId },
    });

    if (existing) {
      throw new ConflictException('Doctor profile already exists');
    }

    return await this.prismaService.doctor.create({
      data: body,
    });
  }

  async updateDoctor(body: UpdateDoctorDto, req, id: number) {
    //Get the Doctor by id
    const Doctor = await this.prismaService.doctor.findUnique({
      where: { id },
    });
    if (!Doctor) {
      throw new NotFoundException(`No Doctor found for id ${id}`);
    }

    //Check if the Doctor is allowed to update the profile
    if (req.user.role === 'DOCTOR' && Doctor.userId !== req.user.id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return await this.prismaService.doctor.update({
      where: { id },
      data: body,
    });
  }

  async getOneDoctor(id: number) {
    const doctor = await this.prismaService.doctor.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!doctor) {
      throw new NotFoundException(`No Doctor found for id ${id}`);
    }

    return doctor;
  }

  async getAllDoctors(query) {
    const apiFeature = new PrismaApiFeatures(query, ['fullName', 'specialty']);
    const options = apiFeature.buildOptions();

    const doctors = await this.prismaService.doctor.findMany(options);
    const total = await this.prismaService.doctor.count({
      where: options.where,
    });

    const paginationInfo = apiFeature.getPaginationInfo(total, doctors.length);

    return { paginationInfo, doctors };
  }
}

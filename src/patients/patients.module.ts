import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller.js';
import { PatientsService } from './patients.service.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService, PrismaService]
})
export class PatientsModule {}
 
import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PatientsService } from './patients.service.js';
import { CreatePatientDto } from './dto/createPatientDto.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UpdatePatientDto } from './dto/updatePatientDto.js';

//patients.controller.ts
@Controller('api/patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'PATIENT')
  @Post('/')
  async createPatient(@Body() body: CreatePatientDto, @Req() req) {
    return await this.patientsService.createPatient(body, req);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'PATIENT')
  @Patch('/:id')
  async updatePatient(
    @Body() body: UpdatePatientDto,
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.patientsService.updatePatient(body, req, id);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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

  @UseGuards(AuthGuard('jwt'))
  @Get('/:id')
  async getOnePatient(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return await this.patientsService.getOnePatient(id, req);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  @Get('/')
  async getAllPatients(@Query() query) {
    return await this.patientsService.getAllPatients(query);
  }
}
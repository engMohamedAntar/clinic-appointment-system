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
import { CreateDoctorDto } from './dto/createDoctorDto.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UpdateDoctorDto } from './dto/updateDoctorDto.js';
import { DoctorsService } from './doctors.service.js';

//doctors.controller.ts
@Controller('api/doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post('/')
  async createDoctor(@Body() body: CreateDoctorDto) {    
    return await this.doctorsService.createDoctor(body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  @Patch('/:id')
  async updateDoctor(
    @Body() body: UpdateDoctorDto,
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.doctorsService.updateDoctor(body, req, id);
  }

  @UseGuards(AuthGuard('jwt')) 
  @Get('/:id')
  async getOneDoctor(@Param('id', ParseIntPipe) id: number) {
    return await this.doctorsService.getOneDoctor(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async getAllDoctors(@Query() query) {
    return await this.doctorsService.getAllDoctors(query);
  }

}

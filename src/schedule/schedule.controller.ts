import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ScheduleService } from './schedule.service.js';
import { CreateScheduleDto } from './dto/createSchedule.dto.js';

@Controller('api/schedules')
export class ScheduleController {
  constructor( private scheduleService: ScheduleService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'DOCTOR') 
  @Post('/')
  createSchedule(@Req() req, @Body() body: CreateScheduleDto) {
    return this.scheduleService.createSchedule(req.user, body);
  }

  @Get('/doctor/:id')
  getDoctorSchedules(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.getDoctorSchedules(id);
  }
  
}

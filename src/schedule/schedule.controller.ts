import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ScheduleService } from './schedule.service.js';
import { CreateScheduleDto } from './dto/createSchedule.dto.js';
import { UpdateScheduleDto } from './dto/UpdateSchedule.dto.js';

@UseGuards(AuthGuard('jwt'))
@Controller('api/schedules')
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  @Post('/')
  createSchedule(@Req() req, @Body() body: CreateScheduleDto) {
    return this.scheduleService.createSchedule(req.user, body);
  }

  @Get('/doctor/:id')
  getDoctorSchedules(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.getDoctorSchedules(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  @Patch('/:id')
  updateSchedule(@Param('id', ParseIntPipe) id: number, @Req() req, @Body() body: UpdateScheduleDto) {
    return this.scheduleService.updateSchedule(id, req.user, body);
  }

}

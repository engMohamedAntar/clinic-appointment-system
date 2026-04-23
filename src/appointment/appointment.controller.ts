import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/createAppointment.dto.js';
import { AppointmentService } from './appointment.service.js';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('api/appointment')
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) {}

    @Roles('PATIENT')
    @Post()
    createAppointment(@Body() createAppointmentDto: CreateAppointmentDto, @Req() req) {
        return this.appointmentService.createAppointment(createAppointmentDto, req.user.id);
    }

    @Roles('PATIENT')
    @Get('/my')
    getMyAppointments( @Query() query ,@Req() req) {
        return this.appointmentService.getMyAppointments(query, req.user.id);
    }

    @Roles('PATIENT')
    @Patch('/:id/cancel')
    cancelAppointment(@Param('id', ParseIntPipe) id: number, @Req() req) {
        return this.appointmentService.cancelAppointment(id, req.user.id);
    }
    
    @Roles('DOCTOR')
    @Get('/doctor/my')
    getMyDoctorAppointments(@Query() query, @Req() req) {
        return this.appointmentService.getMyDoctorAppointments(query, req.user.id);
    }
    
}

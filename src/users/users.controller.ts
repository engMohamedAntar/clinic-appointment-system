//users.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/createUserDto.js';
import { UpdateUserDto } from './dto/updateUserDto.js';


@Controller('api/users')
export class UsersController {
    constructor(private usersService: UsersService) {}
    @Post('/')
    async createUser(@Body() body: CreateUserDto) {
        return await this.usersService.createUser(body);
    }
    @Get('/')
    async getAllUsers() {
        return await this.usersService.getAllUsers();
    }
    @Get('/:id')
    async getUserById(@Param('id', ParseIntPipe) id: number) {
        return await this.usersService.getUserById(id);
    }

    @Put('/:id')
    async updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateUserDto,
    ) {
        return await this.usersService.updateUser(id, body);
    }

    @Delete('/:id')
    async deleteUser(
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.usersService.deleteUser(id);
    }
}

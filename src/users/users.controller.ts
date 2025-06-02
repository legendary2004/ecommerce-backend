import { Body, Controller, Get, Param, Post, Put, Query, Redirect } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { ContactMailDTO } from './dto/contact-mail.dto';

@Controller('users')
export class UsersController {
    constructor (private userService: UsersService) {}

    @Post()
    async createUser(@Body() data: CreateUserDTO) {
        return this.userService.createUser(data)
    }

    @Post("sendMail")
    async sendContactMail(@Body() data: ContactMailDTO) {
        return this.userService.sendMail(data)
    }

    @Get("verifyMail")
    @Redirect("http://localhost:5173/emailVerified")
    async verifyMail(@Query("email") email: string) {
        return this.userService.verifyMail(email)
    }

    @Get("login")
    async login(@Query("email") email: string, @Query("password") password: string) {
        return this.userService.login(email, password)
    }

    @Get(":token")
    async getUser(@Param("token") token: string) {
        return this.userService.getUserFromToken(token)
    }

    @Post("ai")
    async sendMessage(@Query("message") message: string) {
        return this.userService.sendMessage(message)
    }
}

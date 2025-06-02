import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { ContactMailDTO } from './dto/contact-mail.dto';
import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class UsersService {
    private token: string = 'aa';
    private model: string;
    private endpoint: string;

    constructor (private prisma: PrismaService, 
                private mailService: MailService,
                private authService: AuthService,
                private configService: ConfigService) 
                {   
                    const toke = this.configService.get<string>('CLOUDFARE_TOKEN')
                    const mode = this.configService.get<string>('MODEL')
                    const enpoi = this.configService.get<string>('ENDPOINT')
                    
                    this.token = toke || ""
                    this.model = mode || ""
                    this.endpoint = enpoi  || ""
                }

    async createUser(data: CreateUserDTO) {
        if (data.password != data.passwordRepeat)
            throw new BadRequestException("Passwords do not match")

        try {
            const hashedPassword = await this.authService.hashPassword(data.password);
            const {username, email} = data
            const newObj = {username, email, password: hashedPassword, isVerified: 0}
            
            await this.prisma.users.create({
                data: newObj
            })
            await this.mailService.sendEmail(email, username, "Verify your account", 'verify')
        }
        catch (err) {
            if (err.code == 'P2002')
                throw new ConflictException("Email already in use")
            else throw new InternalServerErrorException("Failed to create your account")
        }
    }

    async verifyMail(email: string) {
        try {
            const username = await this.getUsername(email)
            if (!username) {
                throw new NotFoundException('User not found');
            }

            const user = await this.prisma.users.update({
                where: {email},
                data: {isVerified: 1}
            })
            await this.mailService.sendEmail(email, username, `Welcome ${username}`, 'welcome')
            await this.login(user.email, user.password)
        } catch (err) {
            console.log(err)
        }
    }

    async getUsername(email: string): Promise<string | undefined> {
        const currUser = await this.prisma.users.findFirst({where: {email}})
        return currUser?.username
    }

    async sendMail(data: ContactMailDTO) {
        try {
            await this.mailService.sendContactEmail(data)
        }
        catch (err) {
            console.log(err)
            throw new InternalServerErrorException("Form failed to send")
        }
    }

    async login(email: string, password: string) {
        const user = await this.authService.validateUser(email, password);
        console.log(user)
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    async getUserFromToken(token: string) {
        return this.authService.getEmailFromToken(token)
    }

    async sendMessage(userMessage: string) {
        console.log("----")
        console.log(this.token)
        console.log(this.model)
        console.log(this.endpoint)
        // return {
        //     token: this.token,
        //     model: this.model,
        //     endpoint: this.endpoint
        // }
        try {
            const payload = {
            messages: [
                {
                role: 'system',
                content: 'You are a friendly assistant that helps write stories',
                },
                {
                role: 'user',
                content: userMessage,
                },
            ],
        };

        const response = await axios.post(`${this.endpoint}/${this.model}`, payload, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data
        } catch (err) {
            console.log("Error")
        } 
    }
}

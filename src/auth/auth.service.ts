import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    private readonly saltRounds = 10;

    constructor (
        private prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.prisma.users.findUnique({ where: { email } });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password); // hashed password in DB

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isVerified)
            throw new UnauthorizedException('You must verify your account to log in')

        return user;
    }

    async login(user: any) {
        const payload = {username: user.username, sub: user.id}
        const value = this.jwtService.sign(payload)
        console.log(value)
        return {
            accessToken: this.jwtService.sign(payload)
        }
    }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(this.saltRounds);
        const hashed = await bcrypt.hash(password, salt);
        return hashed;
    }

    async getEmailFromToken(token: string) {
        const decoded = this.jwtService.decode(token);
        return decoded;
    }
}

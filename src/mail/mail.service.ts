import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ContactMailDTO } from 'src/users/dto/contact-mail.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly adminEmail: String
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService
  ) {
    const email = this.configService.get<string>('MAIL_USER');
    if (!email) {
      throw new Error('MAIL_USER is not defined in environment variables');
    }
    this.adminEmail = email;
  }

  async sendEmail(email: string, username: string, subject: string, template: string) {
    await this.mailerService.sendMail({
        from: this.adminEmail as any,
        to: email,
        subject,
        template,
        context: {
            username,
            email
        },
    });
  }

  async sendContactEmail(data: ContactMailDTO) {
    const {fullName, email, phone, message} = data
    await this.mailerService.sendMail({
        from: this.adminEmail as any,
        to: this.adminEmail as any,
        subject: "Recieved new mail",
        template: 'contact',
        context: {
            fullName,
            email,
            phone,
            message
        },
    });
  }
}
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [PrismaModule, AuthModule, MailModule],
  providers: [ProductsService],
  controllers: [ProductsController]
})
export class ProductsModule {}

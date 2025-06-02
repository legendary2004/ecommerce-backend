import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { UploadsController } from './uploads/upload-controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',                     
    }),
    PrismaModule, 
    UsersModule, 
    MailModule, 
    AuthModule, 
    ProductsModule
  ],
  providers: [UsersService, PrismaService],
  exports: [PrismaService],
  controllers: [UploadsController]
})
export class AppModule {}

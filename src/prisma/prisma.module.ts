// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClient } from 'generated/prisma';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [PrismaService, PrismaClient],
  exports: [PrismaService],
})
export class PrismaModule {}

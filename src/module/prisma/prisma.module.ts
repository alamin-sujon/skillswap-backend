import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  exports: [PrismaService],
  providers: [PrismaService, ConfigService],
})
export class PrismaModule {}

// src/messages/messages.module.ts
import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesController } from './massages.controller';
import { MessagesService } from './massages.service';

@Module({
  controllers: [MessagesController],
  providers: [MessagesGateway, MessagesService, PrismaService],
  exports: [MessagesService],
})
export class MessagesModule {}

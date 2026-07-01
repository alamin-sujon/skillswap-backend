// src/messages/messages.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { MessagesService } from './massages.service';

@Controller('chats')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('inbox')
  async getInbox() {
    const currentUserId = 'extracted-user-uuid'; // Use standard Passport/Guard extractors here
    return this.messagesService.getUserInbox(currentUserId);
  }

  @Get(':conversationId/messages')
  async getChatHistory(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.messagesService.getChatHistory(
      conversationId,
      parsedLimit,
      cursor,
    );
  }
}

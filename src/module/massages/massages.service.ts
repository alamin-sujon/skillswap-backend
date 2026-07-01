// src/messages/messages.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async validateParticipant(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { userAId: true, userBId: true },
    });
    if (!convo) return false;
    return convo.userAId === userId || convo.userBId === userId;
  }

  async getConversationParticipants(conversationId: string): Promise<string[]> {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { userAId: true, userBId: true },
    });
    return convo ? [convo.userAId, convo.userBId] : [];
  }

  async createMessage(dto: SendMessageDto, senderId: string) {
    return this.prisma.message.create({
      data: {
        content: dto.content,
        conversationId: dto.conversationId,
        senderId: senderId,
      },
      include: {
        sender: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
    });
  }

  // Cursor pagination for Facebook Messenger infinite scroll up
  async getChatHistory(conversationId: string, limit: number, cursor?: string) {
    const messages = await this.prisma.message.findMany({
      where: { conversationId, isDeleted: false },
      take: limit,
      orderBy: { createdAt: 'desc' },
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      include: {
        sender: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });

    const nextCursor =
      messages.length === limit ? messages[messages.length - 1].id : null;

    return {
      messages,
      nextCursor,
    };
  }

  // Messenger dynamic list aggregator (fetches chats, the other profile, and last message snippet)
  async getUserInbox(userId: string) {
    const activeChats = await this.prisma.conversation.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: { select: { id: true, displayName: true, avatarUrl: true } },
        userB: { select: { id: true, displayName: true, avatarUrl: true } },
        messages: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: { isRead: false, senderId: { not: userId } },
            },
          },
        },
      },
    });

    return activeChats
      .map((chat) => {
        const otherUser = chat.userAId === userId ? chat.userB : chat.userA;
        const lastMessage = chat.messages[0] || null;

        return {
          conversationId: chat.id,
          otherUser,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                isRead: lastMessage.isRead,
              }
            : null,
          unreadCount: chat._count.messages,
        };
      })
      .sort((a, b) => {
        const dateA = a.lastMessage
          ? new Date(a.lastMessage.createdAt).getTime()
          : 0;
        const dateB = b.lastMessage
          ? new Date(b.lastMessage.createdAt).getTime()
          : 0;
        return dateB - dateA; // Most recent active threads go to the top
      });
  }
}

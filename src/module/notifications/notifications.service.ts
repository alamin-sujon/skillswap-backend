import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateNotificationDto) {
    const createdAt = dto.createdAt ? new Date(dto.createdAt) : undefined;

    return this.prisma.notification.create({
      data: {
        userId,
        title: dto.title,
        body: dto.body,
        type: dto.type,
        data: dto.data ?? '',
        isRead: dto.isRead ?? false,
        createdAt,
      },
    });
  }

  async listForUser(userId: string, query: ListNotificationsQueryDto) {
    // Build where clause
    const where: any = { userId };
    if (query.type) where.type = query.type;
    if (typeof query.isRead === 'boolean') where.isRead = query.isRead;

    const items = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return items;
  }

  async markOne(userId: string, notificationId: string, isRead: boolean) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) throw new NotFoundException('Notification not found.');
    if (notification.userId !== userId)
      throw new ForbiddenException('Not allowed.');

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead },
    });
  }

  async markManyForUser(userId: string) {
    // Example bulk mark as read:
    // marks all notifications for user (optionally filtered by type)
    const where: any = { userId };
    

    // Prisma updateMany returns count
    const res = await this.prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });

    return { updatedCount: res.count };
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async deleteOne(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, userId: true },
    });

    if (!notification) throw new NotFoundException('Notification not found.');
    if (notification.userId !== userId)
      throw new ForbiddenException('Not allowed.');

    await this.prisma.notification.delete({ where: { id: notificationId } });
    return { deleted: true };
  }
}

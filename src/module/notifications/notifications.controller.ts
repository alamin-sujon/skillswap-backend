import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { JWTPayload } from 'src/common/interface/jwt.interface';
import { GetUser } from 'src/common/decorators/jwt.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  private getUserId(req: Request): string {
    // Adjust to your auth setup:
    return (req as any).user?.id;
  }

  // Create notification (typically used by internal jobs/admin endpoints)
  @Post()
  async create(
    @GetUser() user: JWTPayload,
    @Body() dto: CreateNotificationDto,
  ) {
    console.log({ user });
    return this.notificationsService.create(user.id, dto);
  }

  // List notifications for current user
  @Get()
  async list(
    @GetUser() user: JWTPayload,
    @Query() query: ListNotificationsQueryDto,
  ) {
    console.log({ user });
    return this.notificationsService.listForUser(user.id, query);
  }

  // Unread count
  @Get('unread/count')
  async unreadCount(@GetUser() user: JWTPayload) {
    return { count: await this.notificationsService.getUnreadCount(user?.id) };
  }

  // Mark single notification as read/unread
  @Patch(':id/read')
  async markOne(
    @GetUser() user: JWTPayload,
    @Param('id') id: string,
    @Body() dto: MarkReadDto,
  ) {
    return this.notificationsService.markOne(user.id, id, dto.isRead);
  }

  // Bulk mark all notifications as read (optionally by type)
  @Patch('read-all')
  async markMany(@GetUser() user: JWTPayload, ) {
    return this.notificationsService.markManyForUser(user.id);
  }

  @Delete(':id')
  async deleteOne(@GetUser() user: JWTPayload, @Param('id') id: string) {
    return this.notificationsService.deleteOne(user.id, id);
  }
}

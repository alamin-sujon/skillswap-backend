import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    example: 'New Match Request',
    description: 'Title of the notification',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'You have received a new match request.',
    description: 'Body/content of the notification',
  })
  @IsString()
  body!: string;

  @ApiProperty({
    example: 'NEW_MATCH',
    description:
      'Notification type (e.g. NEW_MATCH, SESSION_REMINDER, MESSAGE, REVIEW)',
  })
  @IsString()
  type!: string;

  @ApiPropertyOptional({
    example: {
      skillId: 'a1b2c3d4',
      userId: 'u123456',
      matchId: 'm987654',
    },
    description: 'Additional notification data stored as JSON',
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether the notification has been read',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({
    example: '2026-07-14T17:42:10.000Z',
    description: 'Notification creation date',
  })
  @IsOptional()
  @IsDateString()
  createdAt?: string;
}

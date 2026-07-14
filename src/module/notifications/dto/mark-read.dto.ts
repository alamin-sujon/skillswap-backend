import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class MarkReadDto {
  @ApiProperty({
    description: 'Whether the notification should be marked as read',
    example: true,
    default: true,
  })
  @IsBoolean()
  isRead!: boolean;
}

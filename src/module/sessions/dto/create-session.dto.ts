import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { SessionFormat } from 'prisma/generated/prisma/enums';

export class CreateSessionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Match ID',
  })
  @IsUUID()
  matchId!: string;

  @ApiPropertyOptional({
    example: 'JavaScript Mentoring Session',
    description: 'Session title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: '2026-06-15T10:00:00.000Z',
    description: 'Session date and time',
  })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    example: 60,
    description: 'Duration in minutes',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiProperty({
    enum: SessionFormat,
    example: SessionFormat.ONLINE,
    description: 'Session format',
  })
  @IsEnum(SessionFormat)
  format!: SessionFormat;

  @ApiPropertyOptional({
    example: 'Dhaka, Bangladesh',
    description: 'Physical meeting location',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: 'https://meet.google.com/abc-defg-hij',
    description: 'Online meeting link',
  })
  @IsOptional()
  @IsUrl()
  meetingLink?: string;

  @ApiPropertyOptional({
    example: 'Bring your laptop and project files.',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { SessionFormat } from 'prisma/generated/prisma/enums';

export class UpdateSessionDto {
  @ApiPropertyOptional({
    example: 'Advanced React Session',
    description: 'Session title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: '2026-06-15T10:00:00.000Z',
    description: 'Session date and time',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    example: 90,
    description: 'Duration in minutes',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({
    enum: SessionFormat,
    example: SessionFormat.ONLINE,
    description: 'Session format',
  })
  @IsOptional()
  @IsEnum(SessionFormat)
  format?: SessionFormat;

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
    example: 'Updated session notes.',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SkillExchangeDto {
  @ApiProperty({ example: 'Basic Photography' })
  @IsString()
  @IsNotEmpty()
  skillTitle!: string;

  @ApiProperty({ example: 'Photography' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiPropertyOptional({
    example: 'I can teach camera basics and composition.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

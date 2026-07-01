import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsString, IsArray, IsOptional, ValidateNested, ArrayMinSize } from 'class-validator';
import { SessionFormat, SkillType } from 'prisma/generated/prisma/enums';

export class CreateSkillPostDto {
  @ApiProperty({ enum: SkillType, example: SkillType.LEARN })
  @IsEnum(SkillType)
  type!: SkillType;

  @ApiProperty({ example: 'Learn Guitar Basics' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Music' })
  @IsString()
  category!: string;

  @ApiProperty({ example: 'I can teach beginner guitar lessons.' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({
    example: ['guitar', 'music', 'beginner'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 'Weekends, evenings' })
  @IsOptional()
  availability?: string;

  @ApiPropertyOptional({ enum: SessionFormat, example: SessionFormat.ONLINE })
  @IsOptional()
  @IsEnum(SessionFormat)
  preferredFormat?: SessionFormat;
}



export class CreateManySkillPostDto {
  @ApiProperty({
    type: [CreateSkillPostDto],
    example: [
      {
        type: 'LEARN',
        title: 'Learn Guitar Basics',
        category: 'Music',
        description: 'I can teach beginner guitar lessons.',
        tags: ['guitar', 'music', 'beginner'],
        availability: 'Weekends, evenings',
        preferredFormat: 'ONLINE',
      },
      {
        type: 'TEACH',
        title: 'Teach Python Programming',
        category: 'Technology',
        description: 'I can teach Python programming for beginners.',
        tags: ['python', 'coding'],
        availability: 'Evenings',
        preferredFormat: 'ONLINE',
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateSkillPostDto)
  @ArrayMinSize(1)
  posts!: CreateSkillPostDto[];
}

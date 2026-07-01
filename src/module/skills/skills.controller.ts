// src/modules/skills/skills.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateManySkillPostDto, CreateSkillPostDto } from './dto/create-skill-post.dto';
import { JwtAuthGuard } from 'src/common/guard/jwt.guard';

@Controller('skills')
@UseGuards(JwtAuthGuard)
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateSkillPostDto) {
    return this.skillsService.create(req.user.id, dto);
  }
  @Post('many')
  createMany(@Req() req: any, @Body() dto: CreateSkillPostDto[]) {
    return this.skillsService.createmany(req.user.id, dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.skillsService.findAll(query);
  }

  @Get('my')
  findMyPosts(@Req() req: any) {
    return this.skillsService.findMyPosts(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: any, @Body() dto: any) {
    return this.skillsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.skillsService.remove(id, req.user.id);
  }
}

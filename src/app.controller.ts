import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Res() res: any): void {
    const indexPath = join(process.cwd(), 'public', 'index.html');
    res.sendFile(indexPath);
  }
}

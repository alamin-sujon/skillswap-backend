import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './module/prisma/prisma.service';

import { RolesGuard } from './common/guard/roles.guard';
import { JwtAuthGuard } from './common/guard/jwt.guard';
// import { TransformInterceptor } from './common/interceptor/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


    app.enableCors({
      origin: 'http://localhost:8081',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    });
  // Serve static files
  const publicDir = join(process.cwd(), 'public');
  app.use('/', express.static(publicDir));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Skill Swap API')
    .setDescription('API documentation for Skill Swap Project')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('docs', app, document);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  const reflector = app.get(Reflector);
  // app.useGlobalInterceptors(new TransformInterceptor(reflector));
  const prisma = app.get(PrismaService);

  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      skipUndefinedProperties: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();

// import {
//   Injectable,
//   Logger,
//   OnModuleDestroy,
//   OnModuleInit,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';

// import { PrismaPg } from '@prisma/adapter-pg';
// import 'dotenv/config';
// import { PrismaClient } from 'prisma/generated/prisma/client';
// import { ENVEnum } from 'src/common/enum/env.enum';

// @Injectable()
// export class PrismaService implements OnModuleInit, OnModuleDestroy {
//   private readonly logger = new Logger(PrismaService.name);
//   private readonly prisma: PrismaClient;
//   private readonly connectionString: string;

//   constructor(private readonly configService: ConfigService) {
//     this.connectionString = this.configService.getOrThrow<string>(
//       ENVEnum.DATABASE_URL,
//     );

//     const adapter = new PrismaPg({ connectionString: this.connectionString });

//     this.prisma = new PrismaClient({
//       adapter,
//       log: [{ emit: 'event', level: 'error' }],
//     });
//     return new Proxy(this, {
//       get: (target, prop) =>
//         prop in target ? target[prop] : target.prisma[prop],
//     });
//   }

//   async onModuleInit() {
//     this.logger.log('[INIT] Prisma connecting...');
//     await this.prisma.$connect();
//     this.logger.log('[INIT] Prisma connected');
//   }

//   async onModuleDestroy() {
//     this.logger.log('[DESTROY] Prisma disconnecting...');
//     await this.prisma.$disconnect();
//     this.logger.log('[DESTROY] Prisma disconnected');
//   }

//   /** Expose Prisma models (like prisma.user, prisma.post, etc.) */
//   get client() {
//     return this.prisma;
//   }
// }

import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg'; // Ensure you have pg installed
import { PrismaClient } from 'prisma/generated/prisma/client';
import { ENVEnum } from 'src/common/enum/env.enum';

@Injectable()
// By extending PrismaClient, PrismaService "is" a PrismaClient
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    const connectionString = configService.getOrThrow<string>(
      ENVEnum.DATABASE_URL,
    );

    // Setup the driver adapter
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    // Pass the adapter to the super constructor (PrismaClient)
    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    this.logger.log('[INIT] Prisma connecting...');
    await this.$connect();
    this.logger.log('[INIT] Prisma connected');
  }

  async onModuleDestroy() {
    this.logger.log('[DESTROY] Prisma disconnecting...');
    await this.$disconnect();
    this.logger.log('[DESTROY] Prisma disconnected');
  }
}

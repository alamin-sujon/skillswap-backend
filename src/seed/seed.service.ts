import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'prisma/generated/prisma/enums';
import { PrismaService } from 'src/module/prisma/prisma.service';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(SeederService.name);

  async onApplicationBootstrap() {
    console.log('Seeding process started...');
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';

    // Salt rounds, default to 10 if not provided
    const saltRounds = 10;

    const superAdmin = await this.prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });

    if (superAdmin) {
      this.logger.log('Admin already exists, skipping seeding.');
      return;
    }

    console.log([superAdmin]);

    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    await this.prisma.user.create({
      data: {
        fullName: 'Super Admin',

        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        isEmailVerified: true,
      },
    });

    console.log(`Default super admin created: ${adminEmail}`);
  }
}

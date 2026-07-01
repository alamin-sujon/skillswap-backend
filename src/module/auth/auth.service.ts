import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { OtpTemplateService } from '../mail/templates/otp.templates';

import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { OtpType } from 'prisma/generated/prisma/enums';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChangePassworDto, ResetPassworDto } from './dto/reset-password';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private otpTemplate: OtpTemplateService,
    private jwtService: JwtService,
  ) {}
  async signUp(createAuthDto: CreateAuthDto) {
    const { email, password, name } = createAuthDto;

    const isUserExist = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    console.log({isUserExist})
    if (isUserExist) {
      throw new BadRequestException('User already exist with this email');
    }

    const hashedPassword = await bcrypt.hash(
      password,
      process.env.SALT_ROUNDS || 10,
    );

    const user = await this.prisma.user.create({
      data: {
        fullName: name,
        email: email,
        password: hashedPassword,
        isEmailVerified: true
      },
    });

    // await this.sendOtpToEmail(email, OtpType.EMAIL_VERIFY);
    return user;
  }

  // login user by email and password
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    console.log({loginDto})
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user?.isEmailVerified) {
      throw new HttpException(
        'Please verify your email first',
        HttpStatus.FORBIDDEN,
      );
    }
    if (user?.isBlocked || user.isDeleted) {
      throw new HttpException(
        'Your account is blocked or deleted',
        HttpStatus.FORBIDDEN,
      );
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new HttpException('Password not matched', HttpStatus.BAD_REQUEST);
    }
    const payload = {
      email: user.email,
      id: user.id,
      role: user.role,
      name: user.fullName,
      isVerified: user.isEmailVerified,
      isBlocked: user.isBlocked,
      isDeleted: user.isDeleted,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET!,
      expiresIn: '1d',
    });

    return {
      token,
      user,
    };
  }

  async sendOtpToEmail(email: string, type: OtpType) {
    const isUserExist = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!isUserExist) {
      throw new NotFoundException('User not found');
    }
    // Invalidate previous OTPs of same type
    await this.prisma.otp.updateMany({
      where: { userId: isUserExist.id, type, used: false },
      data: { used: true },
    });

    if (type === 'EMAIL_VERIFY') {
      if (isUserExist.isEmailVerified) {
        throw new BadRequestException('Email already verified');
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = await bcrypt.hash(otp, 10);

    const result = await this.prisma.otp.create({
      data: {
        userId: isUserExist.id,
        type,
        codeHash: hash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      },
    });

    const res = await this.mail.sendMail({
      to: email,
      subject: 'Your OTP Code',
      html: this.otpTemplate.generateOtpHtml({ otp: Number(otp) }),
    });

    console.log({ res });
    return result;
  }

  async verifyOtp(email: string, type: OtpType, code: string) {
    const isUserExist = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    const otp = await this.prisma.otp.findFirst({
      where: {
        userId: isUserExist?.id,
        type,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log({ otp });

    if (!otp) throw new BadRequestException('OTP expired or invalid');

    if (otp.attempts >= 5) {
      throw new BadRequestException('Too many attempts');
    }

    const valid = await bcrypt.compare(code, otp.codeHash);
    console.log({ valid });

    if (!valid) {
      const res = await this.prisma.otp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      console.log({ res });
      throw new BadRequestException('Invalid OTP');
    }
    const res = await this.prisma.otp.update({
      where: { id: otp.id },
      data: { used: true },
    });
    if (type === OtpType.EMAIL_VERIFY) {
      await this.prisma.user.update({
        where: { id: isUserExist?.id },
        data: { isEmailVerified: true },
      });
    } else if (type === OtpType.RESET_PASSWORD) {
      const token = await this.jwtService.signAsync(
        { userId: isUserExist?.id },
        { expiresIn: '1h', secret: process.env.RESET_PASSWORD_SECRET! },
      );
      return token;
    }

    return res;
  }

  async changePassword(userId: string, dto: ChangePassworDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new HttpException('Password not matched', HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await bcrypt.hash(
      dto?.newPassword,
      process.env.SALT_ROUNDS || 10,
    );
    const result = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });
    return result;
  }

  async forgetPassword(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const result = await this.sendOtpToEmail(email, OtpType.RESET_PASSWORD);
    return result;
  }

  async resetPassword(dto: ResetPassworDto) {
    const payload = await this.jwtService.verifyAsync(dto.token, {
      secret: process.env.RESET_PASSWORD_SECRET!,
    });
    console.log({ payload });
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.userId,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashedPassword = await bcrypt.hash(
      dto?.password,
      process.env.SALT_ROUNDS || 10,
    );
    const result = await this.prisma.user.update({
      where: {
        id: payload.userId,
      },
      data: {
        password: hashedPassword,
      },
    });
    return result;
  }

  @Cron(CronExpression.EVERY_30_MINUTES) // Runs every 30 min
  async cleanup() {
    const res = await this.prisma.otp.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { used: true }],
      },
    });

    if (res.count > 0) {
      console.log(`[Cleanup] Success: Removed ${res.count} records.`);
    }
  }
}

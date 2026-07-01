import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { OtpType } from 'prisma/generated/prisma/enums';

export class SendOtpDTO {
  @ApiProperty({
    description: 'Here will go user email',
    example: 'milon@gmail.com',
  })
  @IsNotEmpty()
  @IsOptional()
  email: string;
  @ApiProperty({
    description: 'OTP purpose',
    enum: Object.values(OtpType),
    example: OtpType.EMAIL_VERIFY,
  })
  @IsEnum(OtpType)
  type: OtpType;
}

export class VerifyOtpDTO {
  @ApiProperty({
    description: 'Here will go user email',
    example: 'milon@gmail.com',
  })
  @IsNotEmpty()
  @IsOptional()
  email: string;
  @ApiProperty({
    description: 'Here will go otp code',
    example: '000000',
  })
  @IsNotEmpty()
  @IsOptional()
  code: string;

  @ApiProperty({
    description: 'OTP purpose',
    enum: Object.values(OtpType),
    example: OtpType.EMAIL_VERIFY,
  })
  @IsEnum(OtpType)
  type: OtpType;
}

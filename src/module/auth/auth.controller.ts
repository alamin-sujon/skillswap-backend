import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
// import { SendOtpDTO } from './dto/otp.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDTO, VerifyOtpDTO } from './dto/otp.dto';
import { GetUser, ValidateAllUser } from 'src/common/decorators/jwt.decorator';
import { JWTPayload } from 'src/common/interface/jwt.interface';
import { successResponse } from 'src/utils/response.utils';
import {
  ChangePassworDto,
  ForgetPassworDto,
  ResetPassworDto,
} from './dto/reset-password';
// import { ResetPassworDto } from './dto/reset_pass.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // signUp route
  @Public()
  @Post('signup')
  @ApiBody({ type: CreateAuthDto })
  @ApiOperation({ summary: 'User SignUp' })
  async signUp(@Body() createAuthDto: CreateAuthDto) {
    const result = await this.authService.signUp(createAuthDto);
    return successResponse(result, 'User created successfully');
  }

  // login route
  @Post('login')
  @Public()
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return successResponse(result, 'Login successfully');
  }

  @Post('generate-otp')
  @Public()
  @ApiBody({ type: SendOtpDTO })
  async generateOtp(@Body() otpDto: SendOtpDTO) {
    const result = await this.authService.sendOtpToEmail(
      otpDto.email,
      otpDto.type,
    );
    return successResponse(result, 'OTP sent successfully');
  }
  @Post('verify-otp')
  @Public()
  @ApiBody({ type: VerifyOtpDTO })
  async verifyOtp(@Body() otpDto: VerifyOtpDTO) {
    const result = await this.authService.verifyOtp(
      otpDto.email,
      otpDto.type,
      otpDto.code,
    );
    return successResponse(result, 'OTP verified successfully');
  }

  @Post('change-password')
  @ApiBody({ type: ChangePassworDto })
  @ValidateAllUser()
  async changePassword(
    @Body() otpDto: ChangePassworDto,
    @GetUser() user: JWTPayload,
  ) {
    const result = await this.authService.changePassword(user?.id, otpDto);
    return successResponse(result, 'Password changed successfully');
  }

  @Post('forget-password')
  @Public()
  @ApiBody({ type: ForgetPassworDto })
  async forgetPassword(@Body() otpDto: ForgetPassworDto) {
    const result = await this.authService.forgetPassword(otpDto.email);
    return successResponse(result, 'Otp send to your email');
  }

  @Post('reset-password')
  @Public()
  @ApiBody({ type: ResetPassworDto })
  async resetPassword(@Body() otpDto: ResetPassworDto) {
    const result = await this.authService.resetPassword(otpDto);
    return successResponse(result, 'Otp send to your email');
  }

  // phone otp route
  // @Post('phone_otp')
  // @Public()
  // @ApiBody({ type: SendOtpDTO })
  // async sendOtp(@Body() otpDto: SendOtpDTO) {
  //   return this.authService.send_otp(otpDto);
  // }

  // email otp route
  // @Post('send_otp_by_email')
  // @Public()
  // @ApiBody({ type: SendOtpDTO })
  // async sendOtpByEmail(@Body() otpDto: SendOtpDTO) {
  //   return this.authService.send_verification_otp_by_email(otpDto);
  // }

  // verrify otp route of email otp
  // @Post('verify-otp')
  // @Public()
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       otp: {
  //         type: 'number',
  //         example: 123456,
  //       },
  //     },
  //   },
  // })
  // async verifyOtp(@Body() boyd: { otp: number }) {
  //   return this.authService.verify_otp_by_email(boyd.otp);
  // }

  // reset password route
  // @Post('reset-password')
  // @ApiBody({ type: ResetPassworDto })
  // async resetPassword(@Body() resetPassDto: ResetPassworDto, @Req() req: any) {
  //   const user = req.user;
  //   return this.authService.reset_password(resetPassDto, user);
  // }

  // @Post('forget-passowrd')
}

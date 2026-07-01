import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPassworDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'give token',
    example: '1234dvszddffggdsgngnrtaqafds56',
  })
  token: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'give your New Pass here',
    example: '123456',
  })
  password: string;
}
export class ChangePassworDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'give your Old Pass here',
    example: '123456',
  })
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'give your New Pass here',
    example: '123456',
  })
  newPassword: string;
}
export class ForgetPassworDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Here will go user email',
    example: 'admin@gmail.com',
  })
  email: string;
}

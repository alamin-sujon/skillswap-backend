import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Here will go user email',
    example: 'admin@gmail.com',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Here will go user password',
    example: '123456',
  })
  password: string;
}
